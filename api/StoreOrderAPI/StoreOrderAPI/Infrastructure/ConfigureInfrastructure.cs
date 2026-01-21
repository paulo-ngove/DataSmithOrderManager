using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using System;

namespace StoreOrderAPI.Infrastructure
{
    public static class ConfigureInfrastructure
    {
        public static void AddInfrastructure(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Store Order Manager API",
                    Version = "v1",
                    Description = "A store order management API with EF Core InMemory database"
                });
            });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowLocalSpa",
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:3000")
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    });
            });

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("StoreOrderDb"));
        }
    }
}
