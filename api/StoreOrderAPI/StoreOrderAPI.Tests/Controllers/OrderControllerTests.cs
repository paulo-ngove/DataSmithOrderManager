namespace StoreOrderAPI.Tests
{
    using AutoMapper;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using NSubstitute;
    using StoreOrderAPI.Domain.Dtos;
    using StoreOrderAPI.Domain.Enums;
    using StoreOrderAPI.Domain.Models;
    using StoreOrderAPI.Infrastructure;
    using StoreOrdersAPI.Controllers;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Xunit;

    public class OrdersControllerTests : IDisposable
    {
        private readonly OrdersController _controller;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public OrdersControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            SeedTestData();

            _mapper = Substitute.For<IMapper>();
            _controller = new OrdersController(_context, _mapper);
        }

        private void SeedTestData()
        {
            var orders = new List<Order>
            {
                new Order
                {
                    Id = 1,
                    OrderNumber = "ORD001",
                    Status = OrderStatus.Pending,
                    SupplierName = "Supplier1",
                    OrderDate = DateTime.UtcNow.AddDays(-5),
                    ExpectedDeliveryDate = DateTime.UtcNow.AddDays(5)
                },
                new Order
                {
                    Id = 2,
                    OrderNumber = "ORD002",
                    Status = OrderStatus.Approved,
                    SupplierName = "Supplier2",
                    OrderDate = DateTime.UtcNow.AddDays(-3),
                    ExpectedDeliveryDate = DateTime.UtcNow.AddDays(7)
                },
                new Order
                {
                    Id = 3,
                    OrderNumber = "ORD003",
                    Status = OrderStatus.Received,
                    SupplierName = "Supplier1",
                    OrderDate = DateTime.UtcNow.AddDays(-10),
                    ExpectedDeliveryDate = DateTime.UtcNow.AddDays(-2),
                    ReceivedDate = DateTime.UtcNow.AddDays(-1)
                }
            };

            var orderItems = new List<OrderLineItem>
            {
                new OrderLineItem { Id = 1, OrderId = 1, ProductName = "Product1", Quantity = 10, UnitPrice = 25.50m },
                new OrderLineItem { Id = 2, OrderId = 1, ProductName = "Product2", Quantity = 5, UnitPrice = 12.75m },
                new OrderLineItem { Id = 3, OrderId = 2, ProductName = "Product3", Quantity = 20, UnitPrice = 8.99m }
            };

            _context.Orders.AddRange(orders);
            _context.OrderLineItems.AddRange(orderItems);
            _context.SaveChanges();
        }

        [Fact]
        public void CanConstruct()
        {
            //Act
            var instance = new OrdersController(_context, _mapper);

            //Assert
            Assert.NotNull(instance);
        }

        [Fact]
        public async Task CanCallGetOrder()
        {
            //Arrange
            var id = 1;

            //Act
            var result = await _controller.GetOrder(id);

            //Assert
            Assert.NotNull(result);
        }

        [Fact]
        public async Task CanCallCreateOrder()
        {
            // Arrange
            var createOrderDto = new CreateOrderDto
            {
                OrderNumber = "ORD004",
                OrderDate = DateTime.UtcNow,
                SupplierName = "Supplier3",
                SupplierContact = "contact@supplier3.com",
                ExpectedDeliveryDate = DateTime.UtcNow.AddDays(10),
                Notes = "Test order",
                OrderLineItems = new List<CreateOrderLineItemDto>
                {
                    new CreateOrderLineItemDto { ProductName = "Product4", Quantity = 15, UnitPrice = 9.99m }
                }
            };

            var orderToReturn = new Order
            {
                Id = 100,
                OrderNumber = "PO-20240122-ABC12345",
                SupplierName = "Supplier3",
                OrderLineItems = new List<OrderLineItem>()
            };

            _mapper.Map<Order>(createOrderDto).Returns(orderToReturn);

            // Mock the line item mapping
            _mapper.Map<OrderLineItem>(Arg.Any<CreateOrderLineItemDto>()).Returns(callInfo =>
            {
                var dto = callInfo.Arg<CreateOrderLineItemDto>();
                return new OrderLineItem
                {
                    ProductName = dto.ProductName,
                    Quantity = dto.Quantity,
                    UnitPrice = dto.UnitPrice,
                    OrderId = orderToReturn.Id 
                };
            });

            // Mock the final order DTO mapping
            _mapper.Map<OrderDto>(Arg.Any<Order>()).Returns(callInfo =>
            {
                var order = callInfo.Arg<Order>();
                return new OrderDto
                {
                    Id = order.Id,
                    OrderNumber = order.OrderNumber,
                    SupplierName = order.SupplierName,
                    TotalAmount = order.TotalAmount
                };
            });

            // Mock the order number check to return false (order number doesn't exist)
            var orderNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

            // Act
            var result = await _controller.CreateOrder(createOrderDto);

            // Assert
            Assert.NotNull(result);
            var createdAtResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedOrderDto = Assert.IsType<OrderDto>(createdAtResult.Value);
            Assert.Equal(100, returnedOrderDto.Id);
            Assert.NotNull(returnedOrderDto.OrderNumber);
            Assert.StartsWith("PO-", returnedOrderDto.OrderNumber);
        }

        [Fact]
        public async Task CanCallUpdateOrder()
        {
            //Arrange
            var id = 1;
            var updateOrderDto = new UpdateOrderDto
            {
                Status = "Received",
                ReceivedDate = DateTime.UtcNow,
                Notes = "Updated notes"
            };

            //Act
            var result = await _controller.UpdateOrder(id, updateOrderDto);

            //Assert
            Assert.NotNull(result);
        }
        [Fact]
        public async Task CanCallPatchOrder()
        {
            //Arrange
            var id = 1;
            var updateOrderDto = new UpdateOrderDto
            {
                Status = "OnHold",
                Notes = "Patched notes"
            };

            //Act
            var result = await _controller.PatchOrder(id, updateOrderDto);

            //Assert
            Assert.NotNull(result);
        }

        [Fact]
        public async Task CanCallUpdateOrderStatus()
        {
            //Arrange
            var id = 1;
            var statusUpdateDto = new OrderStatusUpdateDto
            {
                Status = OrderStatus.OnHold,
                Notes = "Status updated"
            };

            //Act
            var result = await _controller.UpdateOrderStatus(id, statusUpdateDto);

            //Assert
            Assert.NotNull(result);
        }

        [Fact]
        public async Task CanCallDeleteOrder()
        {
            //Arrange
            var id = 2;

            //Act
            var result = await _controller.DeleteOrder(id);

            //Assert
            Assert.NotNull(result);
        }
        [Fact]
        public async Task CanCallGetOrderItems()
        {
            //Arrange
            var id = 1;

            //Act
            var result = await _controller.GetOrderItems(id);

            //Assert
            Assert.NotNull(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}