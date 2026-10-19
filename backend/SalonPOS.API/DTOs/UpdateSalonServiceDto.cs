
using System.ComponentModel.DataAnnotations;

namespace SalonPOS.API.DTOs
{
    public class UpdateSalonServiceDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(0.01, 1000000)]
        public decimal Price { get; set; }

        [Range(1, 1440)]
        public int DurationMinutes { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
