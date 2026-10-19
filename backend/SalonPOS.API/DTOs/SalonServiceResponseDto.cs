
namespace SalonPOS.API.DTOs
{
    public class SalonServiceResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public int DurationMinutes { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
