
using Microsoft.EntityFrameworkCore;

namespace SalonPOS.API.Data
{
    public class SalonDbContext : DbContext
    {
        public SalonDbContext(DbContextOptions<SalonDbContext> options)
            : base(options)
        {
        }
    }
}
