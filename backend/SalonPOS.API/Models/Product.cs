
using System.ComponentModel.DataAnnotations;

namespace SalonPOS.API.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int Stock { get; set; }

        [MaxLength(10)]
        public string Icon { get; set; } = "🧴";
    }
}
