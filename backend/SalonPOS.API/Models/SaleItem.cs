
using System.ComponentModel.DataAnnotations;

namespace SalonPOS.API.Models
{
    public class SaleItem
    {
        public int Id { get; set; }

        public int SaleId { get; set; }

        public Sale Sale { get; set; } = null!;

        // Exactly one of these IDs should be provided.
        public int? ProductId { get; set; }

        public int? SalonServiceId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ItemName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string ItemType { get; set; } = string.Empty;

        public decimal UnitPrice { get; set; }

        [Range(1, 10000)]
        public int Quantity { get; set; }

        public decimal LineTotal { get; set; }
    }
}
