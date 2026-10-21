
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SalonPOS.API.Models;

namespace SalonPOS.API.Data
{
    public class SalonDbContext : IdentityDbContext<ApplicationUser>
    {
        public SalonDbContext(
            DbContextOptions<SalonDbContext> options)
            : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<SalonService> SalonServices { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Employee>()
                .Property(e => e.Salary)
                .HasPrecision(18, 2);

            builder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            builder.Entity<SalonService>()
                .Property(s => s.Price)
                .HasPrecision(18, 2);

            builder.Entity<Sale>()
                .Property(s => s.AmountReceived)
                .HasPrecision(18, 2);

            builder.Entity<Sale>()
                .Property(s => s.ChangeDue)
                .HasPrecision(18, 2);

            builder.Entity<Sale>()
                .Property(s => s.Subtotal)
                .HasPrecision(18, 2);

            builder.Entity<SaleItem>()
                .Property(s => s.LineTotal)
                .HasPrecision(18, 2);

            builder.Entity<SaleItem>()
                .Property(s => s.UnitPrice)
                .HasPrecision(18, 2);
        }
    }
}
