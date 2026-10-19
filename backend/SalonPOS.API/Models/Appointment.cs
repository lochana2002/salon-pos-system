
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalonPOS.API.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int SalonServiceId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled";

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Employee? Employee { get; set; }

        [ForeignKey(nameof(SalonServiceId))]
        public SalonService? SalonService { get; set; }
    }
}
