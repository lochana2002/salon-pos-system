
using System.ComponentModel.DataAnnotations;

namespace SalonPOS.API.Models
{
    public class Sale
    {
        public int Id { get; set; }

        public DateTime SaleDate { get; set; } = DateTime.UtcNow;

        // Null means this is a walk-in customer.
        public int? CustomerId { get; set; }

        [Required]
        [MaxLength(30)]
        public string PaymentMethod { get; set; } = "Cash";

        public decimal Subtotal { get; set; }

        public decimal AmountReceived { get; set; }

        public decimal ChangeDue { get; set; }

        public List<SaleItem> Items { get; set; } = new();
    }
}
