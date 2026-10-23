
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonPOS.API.Data;
using SalonPOS.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace SalonPOS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly SalonDbContext _db;

        public SalesController(SalonDbContext db)
        {
            _db = db;
        }

        public class CreateSaleRequest
        {
            public int? CustomerId { get; set; }
            public string PaymentMethod { get; set; } = "Cash";
            public decimal? AmountReceived { get; set; }
            public List<CreateSaleItemRequest> Items { get; set; } = new();
        }

        public class CreateSaleItemRequest
        {
            public int ItemId { get; set; }
            public string ItemType { get; set; } = string.Empty;
            public int Quantity { get; set; }
        }

        // POST: api/Sales
        [HttpPost]
        public async Task<IActionResult> CreateSale(
            [FromBody] CreateSaleRequest request)
        {
            if (request.Items == null || request.Items.Count == 0)
                return BadRequest(new { message = "The sale has no items." });

            var paymentMethod = request.PaymentMethod?.Trim();

            if (paymentMethod is not ("Cash" or "Card" or "Bank Transfer"))
                return BadRequest(new { message = "Invalid payment method." });

            if (request.Items.Any(i =>
                i.ItemId <= 0 || i.Quantity <= 0 ||
                (i.ItemType != "product" && i.ItemType != "service")))
            {
                return BadRequest(new { message = "One or more items are invalid." });
            }

            if (request.CustomerId.HasValue &&
                !await _db.Customers.AnyAsync(
                    c => c.Id == request.CustomerId.Value))
            {
                return BadRequest(new { message = "Customer not found." });
            }

            var requestedItems = request.Items
                .GroupBy(i => new { Type = i.ItemType, i.ItemId })
                .Select(g => new
                {
                    g.Key.Type,
                    g.Key.ItemId,
                    Quantity = g.Sum(i => i.Quantity)
                })
                .ToList();

            await using var transaction =
                await _db.Database.BeginTransactionAsync();

            try
            {
                var sale = new Sale
                {
                    CustomerId = request.CustomerId,
                    PaymentMethod = paymentMethod!,
                    SaleDate = DateTime.UtcNow
                };

                decimal subtotal = 0m;

                foreach (var item in requestedItems)
                {
                    string name;
                    decimal price;
                    int? productId = null;
                    int? serviceId = null;

                    if (item.Type == "product")
                    {
                        var product = await _db.Products
                            .FirstOrDefaultAsync(p => p.Id == item.ItemId);

                        if (product == null)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest(new
                            {
                                message = $"Product {item.ItemId} was not found."
                            });
                        }

                        if (product.Stock < item.Quantity)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest(new
                            {
                                message = $"Not enough stock for {product.Name}.",
                                availableStock = product.Stock
                            });
                        }

                        name = product.Name;
                        price = product.Price;
                        productId = product.Id;
                        product.Stock -= item.Quantity;
                    }
                    else
                    {
                        var service = await _db.SalonServices
                            .FirstOrDefaultAsync(s =>
                                s.Id == item.ItemId && s.IsActive);

                        if (service == null)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest(new
                            {
                                message = $"Active service {item.ItemId} was not found."
                            });
                        }

                        name = service.Name;
                        price = service.Price;
                        serviceId = service.Id;
                    }

                    var lineTotal = price * item.Quantity;
                    subtotal += lineTotal;

                    sale.Items.Add(new SaleItem
                    {
                        ProductId = productId,
                        SalonServiceId = serviceId,
                        ItemName = name,
                        ItemType = item.Type,
                        UnitPrice = price,
                        Quantity = item.Quantity,
                        LineTotal = lineTotal
                    });
                }

                if (subtotal <= 0)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new
                    {
                        message = "The sale total must be positive."
                    });
                }

                decimal amountReceived;

                if (paymentMethod == "Cash")
                {
                    if (!request.AmountReceived.HasValue ||
                        request.AmountReceived.Value < subtotal)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new
                        {
                            message = "Cash received must cover the total."
                        });
                    }

                    amountReceived = request.AmountReceived.Value;
                }
                else
                {
                    amountReceived = subtotal;
                }

                sale.Subtotal = subtotal;
                sale.AmountReceived = amountReceived;
                sale.ChangeDue = amountReceived - subtotal;

                _db.Sales.Add(sale);
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Sale saved successfully.",
                    saleId = sale.Id,
                    saleDate = sale.SaleDate,
                    customerId = sale.CustomerId,
                    paymentMethod = sale.PaymentMethod,
                    subtotal = sale.Subtotal,
                    amountReceived = sale.AmountReceived,
                    changeDue = sale.ChangeDue,
                    items = sale.Items.Select(i => new
                    {
                        i.ItemName,
                        i.ItemType,
                        i.UnitPrice,
                        i.Quantity,
                        i.LineTotal
                    })
                });
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    message = "Could not save the sale. Please try again."
                });
            }
        }

        // GET: api/Sales/today
        [HttpGet("today")]
        public async Task<IActionResult> GetTodaySales()
        {
            var startOfToday = DateTime.UtcNow.Date;
            var startOfTomorrow = startOfToday.AddDays(1);

            var todaysSales = _db.Sales
                .Where(s =>
                    s.SaleDate >= startOfToday &&
                    s.SaleDate < startOfTomorrow);

            var totalRevenue = await todaysSales
                .SumAsync(s => (decimal?)s.Subtotal) ?? 0m;

            var salesCount = await todaysSales.CountAsync();

            return Ok(new
            {
                totalRevenue,
                salesCount
            });
        }
    }
}
