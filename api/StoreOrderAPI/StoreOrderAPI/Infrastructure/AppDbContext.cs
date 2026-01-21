using Microsoft.EntityFrameworkCore;
using StoreOrderAPI.Domain.Models;

namespace StoreOrderAPI.Infrastructure
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderLineItem> OrderLineItems { get; set; }
    }
}
