
using System;
using System.ComponentModel.DataAnnotations;

namespace SalonPOS.API.Models
{
    public class SalonService
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Range(0.01, 1000000)]
        public decimal Price { get; set; }

        [Range(1, 1440)]
        public int DurationMinutes { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
