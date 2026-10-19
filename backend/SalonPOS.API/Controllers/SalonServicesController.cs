
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonPOS.API.Data;
using SalonPOS.API.DTOs;
using SalonPOS.API.Models;

namespace SalonPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalonServicesController : ControllerBase
    {
        private readonly SalonDbContext _context;

public SalonServicesController(SalonDbContext context)
{
    _context = context;
}

        // GET: api/SalonServices
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalonServiceResponseDto>>> GetServices()
        {
            var services = await _context.SalonServices
                .OrderBy(s => s.Name)
                .Select(s => new SalonServiceResponseDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Category = s.Category,
                    Description = s.Description,
                    Price = s.Price,
                    DurationMinutes = s.DurationMinutes,
                    IsActive = s.IsActive,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            return Ok(services);
        }

        // GET: api/SalonServices/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SalonServiceResponseDto>> GetService(int id)
        {
            var service = await _context.SalonServices
                .Where(s => s.Id == id)
                .Select(s => new SalonServiceResponseDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Category = s.Category,
                    Description = s.Description,
                    Price = s.Price,
                    DurationMinutes = s.DurationMinutes,
                    IsActive = s.IsActive,
                    CreatedAt = s.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (service == null)
            {
                return NotFound();
            }

            return Ok(service);
        }

        // POST: api/SalonServices
        [HttpPost]
        public async Task<ActionResult<SalonServiceResponseDto>> CreateService(
            CreateSalonServiceDto dto)
        {
            var service = new SalonService
            {
                Name = dto.Name,
                Category = dto.Category,
                Description = dto.Description,
                Price = dto.Price,
                DurationMinutes = dto.DurationMinutes,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.SalonServices.Add(service);
            await _context.SaveChangesAsync();

            var response = new SalonServiceResponseDto
            {
                Id = service.Id,
                Name = service.Name,
                Category = service.Category,
                Description = service.Description,
                Price = service.Price,
                DurationMinutes = service.DurationMinutes,
                IsActive = service.IsActive,
                CreatedAt = service.CreatedAt
            };

            return CreatedAtAction(
                nameof(GetService),
                new { id = service.Id },
                response);
        }

        // PUT: api/SalonServices/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(
            int id,
            UpdateSalonServiceDto dto)
        {
            var service = await _context.SalonServices.FindAsync(id);

            if (service == null)
            {
                return NotFound();
            }

            service.Name = dto.Name;
            service.Category = dto.Category;
            service.Description = dto.Description;
            service.Price = dto.Price;
            service.DurationMinutes = dto.DurationMinutes;
            service.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/SalonServices/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.SalonServices.FindAsync(id);

            if (service == null)
            {
                return NotFound();
            }

            _context.SalonServices.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
