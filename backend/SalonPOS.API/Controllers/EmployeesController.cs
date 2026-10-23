
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonPOS.API.Data;
using SalonPOS.API.DTOs;
using SalonPOS.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace SalonPOS.API.Controllers
{

    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly SalonDbContext _context;

        public EmployeesController(SalonDbContext context)
        {
            _context = context;
        }

        // GET: api/employees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> GetEmployees()
        {
            var employees = await _context.Employees
                .Select(e => new EmployeeResponseDto
                {
                    Id = e.Id,
                    FullName = e.FullName,
                    Phone = e.Phone,
                    Email = e.Email,
                    JobTitle = e.JobTitle,
                    Salary = e.Salary,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();

            return Ok(employees);
        }

        // GET: api/employees/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployee(int id)
        {
            var employee = await _context.Employees
                .Where(e => e.Id == id)
                .Select(e => new EmployeeResponseDto
                {
                    Id = e.Id,
                    FullName = e.FullName,
                    Phone = e.Phone,
                    Email = e.Email,
                    JobTitle = e.JobTitle,
                    Salary = e.Salary,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return NotFound();
            }

            return Ok(employee);
        }

        // POST: api/employees
        [HttpPost]
        public async Task<ActionResult<EmployeeResponseDto>> CreateEmployee(
            CreateEmployeeDto dto)
        {
            var employee = new Employee
            {
                FullName = dto.FullName,
                Phone = dto.Phone,
                Email = dto.Email,
                JobTitle = dto.JobTitle,
                Salary = dto.Salary,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            var response = new EmployeeResponseDto
            {
                Id = employee.Id,
                FullName = employee.FullName,
                Phone = employee.Phone,
                Email = employee.Email,
                JobTitle = employee.JobTitle,
                Salary = employee.Salary,
                IsActive = employee.IsActive,
                CreatedAt = employee.CreatedAt
            };

            return CreatedAtAction(
                nameof(GetEmployee),
                new { id = employee.Id },
                response);
        }

        // PUT: api/employees/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(
            int id, UpdateEmployeeDto dto)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            employee.FullName = dto.FullName;
            employee.Phone = dto.Phone;
            employee.Email = dto.Email;
            employee.JobTitle = dto.JobTitle;
            employee.Salary = dto.Salary;
            employee.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/employees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
