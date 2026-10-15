
using Microsoft.EntityFrameworkCore;
using SalonPOS.API.Models;

namespace SalonPOS.API.Data
{
    public class SalonDbContext : DbContext
    {
        public SalonDbContext(
            DbContextOptions<SalonDbContext> options)
            : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Employee> Employees { get; set; }
    }
}
