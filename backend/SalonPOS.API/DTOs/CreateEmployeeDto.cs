
using System.ComponentModel.DataAnnotations;

namespace SalonPOS.API.DTOs
{
    public class CreateEmployeeDto
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }

        [Required]
        [StringLength(100)]
        public string JobTitle { get; set; } = string.Empty;

        [Range(0, 100000000)]
        public decimal Salary { get; set; }
    }
}
