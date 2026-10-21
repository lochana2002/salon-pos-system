
using Microsoft.AspNetCore.Identity;
using SalonPOS.API.Models;

namespace SalonPOS.API.Data
{
    public static class IdentitySeeder
    {
        public static async Task SeedAsync(
            IServiceProvider services)
        {
            var roleManager =
                services.GetRequiredService<RoleManager<IdentityRole>>();

            var userManager =
                services.GetRequiredService<UserManager<ApplicationUser>>();

            var configuration =
                services.GetRequiredService<IConfiguration>();

            string[] roles =
            {
                "Admin",
                "Manager",
                "Receptionist",
                "Cashier",
                "Stylist"
            };

            // Create roles if they do not exist.
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    var roleResult = await roleManager.CreateAsync(
                        new IdentityRole(role));

                    if (!roleResult.Succeeded)
                    {
                        throw new InvalidOperationException(
                            $"Could not create role {role}: " +
                            string.Join(", ",
                                roleResult.Errors.Select(e => e.Description)));
                    }
                }
            }

            var email = configuration["AdminSeed:Email"];
            var password = configuration["AdminSeed:Password"];

            if (string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException(
                    "Initial Admin email or password is missing from User Secrets.");
            }

            var admin = await userManager.FindByEmailAsync(email);

            // Create the initial Admin only if it does not exist.
            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = "System Administrator",
                    EmailConfirmed = true,
                    IsActive = true
                };

                var createResult = await userManager.CreateAsync(
                    admin, password);

                if (!createResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        "Could not create initial Admin: " +
                        string.Join(", ",
                            createResult.Errors.Select(e => e.Description)));
                }
            }

            // Ensure this account has the Admin role.
            if (!await userManager.IsInRoleAsync(admin, "Admin"))
            {
                var roleResult = await userManager.AddToRoleAsync(
                    admin, "Admin");

                if (!roleResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        "Could not assign Admin role: " +
                        string.Join(", ",
                            roleResult.Errors.Select(e => e.Description)));
                }
            }

            Console.WriteLine(
                $"Identity seeding completed. Admin email: {email}");
        }
    }
}
