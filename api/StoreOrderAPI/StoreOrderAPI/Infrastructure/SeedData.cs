using StoreOrderAPI.Domain.Enums;
using StoreOrderAPI.Domain.Models;

namespace StoreOrderAPI.Infrastructure
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            if (context.Orders.Any())
            {
                return;
            }

            var orders = new List<Order>
            {
                new Order
                {
                    OrderNumber = "PO-2024-001",
                    OrderDate = DateTime.UtcNow.AddDays(-10),
                    SupplierName = "Global Office Supplies Inc.",
                    SupplierContact = "John Smith",
                    SupplierEmail = "john@globaloffice.com",
                    SupplierPhone = "+1-555-0101",
                    Status = OrderStatus.Received,
                    TotalAmount = 2450.95m,
                    ExpectedDeliveryDate = DateTime.UtcNow.AddDays(-3),
                    ReceivedDate = DateTime.UtcNow.AddDays(-3),
                    Notes = "Delivered on time, good packaging",
                    CreatedBy = "Admin",
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Order
                {
                    OrderNumber = "PO-2024-002",
                    OrderDate = DateTime.UtcNow.AddDays(-7),
                    SupplierName = "Tech Equipment Ltd.",
                    SupplierContact = "Sarah Johnson",
                    SupplierEmail = "sarah@techequipment.com",
                    SupplierPhone = "+1-555-0102",
                    Status = OrderStatus.Ordered,
                    TotalAmount = 4850.95m,
                    ExpectedDeliveryDate = DateTime.UtcNow.AddDays(3),
                    Notes = "Waiting for stock confirmation",
                    CreatedBy = "Manager",
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Order
                {
                    OrderNumber = "PO-2024-003",
                    OrderDate = DateTime.UtcNow.AddDays(-5),
                    SupplierName = "Industrial Materials Co.",
                    SupplierContact = "Mike Wilson",
                    SupplierEmail = "mike@industrialmaterials.com",
                    SupplierPhone = "+1-555-0103",
                    Status = OrderStatus.Pending,
                    TotalAmount = 1250.50m,
                    ExpectedDeliveryDate = DateTime.UtcNow.AddDays(7),
                    Notes = "Requires approval from Finance",
                    CreatedBy = "Purchaser",
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Order
                {
                    OrderNumber = "PO-2024-004",
                    OrderDate = DateTime.UtcNow.AddDays(-3),
                    SupplierName = "Food & Beverage Distributors",
                    SupplierContact = "Emma Davis",
                    SupplierEmail = "emma@foodbeverage.com",
                    SupplierPhone = "+1-555-0104",
                    Status = OrderStatus.Approved,
                    TotalAmount = 850.75m,
                    ExpectedDeliveryDate = DateTime.UtcNow.AddDays(5),
                    Notes = "Approved by Head of Department",
                    CreatedBy = "Admin",
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    UpdatedAt = DateTime.UtcNow
                },
                new Order
                {
                    OrderNumber = "PO-2024-005",
                    OrderDate = DateTime.UtcNow.AddDays(-1),
                    SupplierName = "Medical Supplies Corp.",
                    SupplierContact = "Dr. Robert Chen",
                    SupplierEmail = "robert@medicalsupplies.com",
                    SupplierPhone = "+1-555-0105",
                    Status = OrderStatus.Draft,
                    TotalAmount = 3200.25m,
                    ExpectedDeliveryDate = DateTime.UtcNow.AddDays(10),
                    Notes = "Still adding items to order",
                    CreatedBy = "Manager",
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Orders.AddRange(orders);
            context.SaveChanges();

            var orderLineItems = new List<OrderLineItem>
            {
                new OrderLineItem
                {
                    OrderId = 1,
                    ProductName = "Premium Office Chair",
                    ProductCode = "OS-001",
                    Description = "Ergonomic office chair with lumbar support",
                    Quantity = 5,
                    Unit = UnitType.Piece,
                    UnitPrice = 299.99m,
                    LineTotal = 1499.95m
                },
                new OrderLineItem
                {
                    OrderId = 1,
                    ProductName = "Executive Desk",
                    ProductCode = "OS-002",
                    Description = "Solid wood executive desk",
                    Quantity = 2,
                    Unit = UnitType.Piece,
                    UnitPrice = 899.99m,
                    LineTotal = 1799.98m
                },
                new OrderLineItem
                {
                    OrderId = 2,
                    ProductName = "Laptop - Dell XPS 15",
                    ProductCode = "TE-001",
                    Description = "15-inch business laptop, 16GB RAM, 512GB SSD",
                    Quantity = 3,
                    Unit = UnitType.Piece,
                    UnitPrice = 1599.99m,
                    LineTotal = 4799.97m
                },
                new OrderLineItem
                {
                    OrderId = 3,
                    ProductName = "Steel Beams",
                    ProductCode = "IM-001",
                    Description = "Structural steel beams 6m length",
                    Quantity = 10,
                    Unit = UnitType.Piece,
                    UnitPrice = 129.99m,
                    LineTotal = 1299.90m
                },
                new OrderLineItem
                {
                    OrderId = 4,
                    ProductName = "Coffee Beans",
                    ProductCode = "FB-002",
                    Description = "Arabica coffee beans",
                    Quantity = 25,
                    Unit = UnitType.Kilogram,
                    UnitPrice = 24.99m,
                    LineTotal = 624.75m,
                }
            };

            // Add order line items to context
            context.OrderLineItems.AddRange(orderLineItems);
            context.SaveChanges();

            // Verify we have exactly 5 records in each table
            var orderCount = context.Orders.Count();
            var lineItemCount = context.OrderLineItems.Count();

            Console.WriteLine($"Seeded {orderCount} orders and {lineItemCount} order line items.");
        }
    }
}
