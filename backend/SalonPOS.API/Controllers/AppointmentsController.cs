
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonPOS.API.Data;
using SalonPOS.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace SalonPOS.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly SalonDbContext _context;

        public AppointmentsController(SalonDbContext context)
        {
            _context = context;
        }

        // GET: api/appointments
        [HttpGet]
        public async Task<IActionResult> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Employee)
                .Include(a => a.SalonService)
                .OrderBy(a => a.StartTime)
                .Select(a => new
                {
                    a.Id,
                    a.CustomerId,
                    CustomerName = a.Customer != null
                        ? a.Customer.FullName : "",
                    a.EmployeeId,
                    EmployeeName = a.Employee != null
                        ? a.Employee.FullName : "",
                    a.SalonServiceId,
                    ServiceName = a.SalonService != null
                        ? a.SalonService.Name : "",
                    ServicePrice = a.SalonService != null
                        ? a.SalonService.Price : 0m,
                    ServiceDurationMinutes = a.SalonService != null
                        ? a.SalonService.DurationMinutes : 0,
                    a.StartTime,
                    a.Status,
                    a.Notes,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/appointments/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Employee)
                .Include(a => a.SalonService)
                .Where(a => a.Id == id)
                .Select(a => new
                {
                    a.Id,
                    a.CustomerId,
                    CustomerName = a.Customer != null
                        ? a.Customer.FullName : "",
                    a.EmployeeId,
                    EmployeeName = a.Employee != null
                        ? a.Employee.FullName : "",
                    a.SalonServiceId,
                    ServiceName = a.SalonService != null
                        ? a.SalonService.Name : "",
                    ServicePrice = a.SalonService != null
                        ? a.SalonService.Price : 0m,
                    ServiceDurationMinutes = a.SalonService != null
                        ? a.SalonService.DurationMinutes : 0,
                    a.StartTime,
                    a.Status,
                    a.Notes,
                    a.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            return Ok(appointment);
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<IActionResult> CreateAppointment(
            [FromBody] Appointment request)
        {
            if (request.Id != 0)
                return BadRequest(new { message = "Do not provide an appointment ID." });

            if (request.StartTime == default)
                return BadRequest(new { message = "Please provide an appointment date and time." });

            if (request.StartTime <= DateTime.Now)
                return BadRequest(new { message = "Appointment must be in the future." });

            if (request.CustomerId <= 0 ||
                request.EmployeeId <= 0 ||
                request.SalonServiceId <= 0)
            {
                return BadRequest(new { message = "Select a customer, employee, and service." });
            }

            var customerExists = await _context.Customers
                .AnyAsync(c => c.Id == request.CustomerId);

            var employeeExists = await _context.Employees
                .AnyAsync(e => e.Id == request.EmployeeId);

            var service = await _context.SalonServices
                .FirstOrDefaultAsync(s => s.Id == request.SalonServiceId && s.IsActive);

            if (!customerExists)
                return BadRequest(new { message = "Customer not found." });

            if (!employeeExists)
                return BadRequest(new { message = "Employee not found." });

            if (service == null)
                return BadRequest(new { message = "Active salon service not found." });

            var endTime = request.StartTime.AddMinutes(service.DurationMinutes);

            var hasConflict = await _context.Appointments
                .Include(a => a.SalonService)
                .AnyAsync(a =>
                    a.EmployeeId == request.EmployeeId &&
                    a.Status != "Cancelled" &&
                    a.SalonService != null &&
                    request.StartTime < a.StartTime.AddMinutes(a.SalonService.DurationMinutes) &&
                    a.StartTime < endTime);

            if (hasConflict)
                return Conflict(new { message = "This employee already has an appointment during that time." });

            request.Status = "Scheduled";
            request.CreatedAt = DateTime.UtcNow;
            request.Notes = request.Notes?.Trim();

            _context.Appointments.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetAppointment),
                new { id = request.Id },
                new { id = request.Id, message = "Appointment booked successfully." });
        }

        // PUT: api/appointments/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id, [FromBody] UpdateAppointmentStatusRequest request)
        {
            var allowedStatuses = new[]
            {
                "Scheduled", "Confirmed", "Completed", "Cancelled"
            };

            if (!allowedStatuses.Contains(request.Status))
                return BadRequest(new { message = "Invalid appointment status." });

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            appointment.Status = request.Status;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment status updated successfully." });
        }
    }

    public class UpdateAppointmentStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
