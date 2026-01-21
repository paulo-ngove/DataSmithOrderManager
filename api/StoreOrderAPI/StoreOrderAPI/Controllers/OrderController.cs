using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreOrderAPI.Domain.Dtos;
using StoreOrderAPI.Domain.Enums;
using StoreOrderAPI.Domain.Models;
using StoreOrderAPI.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StoreOrdersAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public OrdersController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/orders
        /// <summary>
        /// Get the list of orders
        /// </summary>
        /// <param name="status"></param>
        /// <param name="supplierName"></param>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <param name="orderNumber"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders(
            [FromQuery] OrderStatus? status = null,
            [FromQuery] string? supplierName = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? orderNumber = null)
        {
            var query = _context.Orders
                .Include(o => o.OrderLineItems)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
            }

            if (!string.IsNullOrEmpty(supplierName))
            {
                query = query.Where(o => o.SupplierName.Contains(supplierName));
            }

            if (!string.IsNullOrEmpty(orderNumber))
            {
                query = query.Where(o => o.OrderNumber.Contains(orderNumber));
            }

            if (startDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= endDate.Value);
            }

            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .ProjectTo<OrderDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/orders/{id}
        /// <summary>
        /// Get order by OrderId
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderLineItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return _mapper.Map<OrderDto>(order);
        }

        // POST: api/orders
        /// <summary>
        /// Create a new order record
        /// </summary>
        /// <param name="createOrderDto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto createOrderDto)
        {
            var orderNumber = string.IsNullOrEmpty(createOrderDto.OrderNumber)
                ? $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}"
                : createOrderDto.OrderNumber;

            if (await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber))
            {
                return BadRequest($"Order number '{orderNumber}' already exists.");
            }

            var order = _mapper.Map<Order>(createOrderDto);
            order.OrderNumber = orderNumber;

            decimal totalAmount = 0;
            foreach (var itemDto in createOrderDto.OrderLineItems)
            {
                var lineItem = _mapper.Map<OrderLineItem>(itemDto);
                lineItem.OrderId = order.Id; // Will be set after order is saved
                order.OrderLineItems.Add(lineItem);
                totalAmount += lineItem.LineTotal;
            }

            order.TotalAmount = totalAmount;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var orderDto = _mapper.Map<OrderDto>(order);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, orderDto);
        }

        // PUT: api/orders/{id}
        /// <summary>
        /// Update an order record for specified orderId
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updateOrderDto"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, UpdateOrderDto updateOrderDto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _mapper.Map(updateOrderDto, order);
            order.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PATCH: api/orders/{id}
        /// <summary>
        /// Partially updates the order record
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updateOrderDto"></param>
        /// <returns></returns>
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchOrder(int id, UpdateOrderDto updateOrderDto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _mapper.Map(updateOrderDto, order);
            order.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PUT: api/orders/{id}/status
        /// <summary>
        /// Updates order status
        /// </summary>
        /// <param name="id"></param>
        /// <param name="statusUpdateDto"></param>
        /// <returns></returns>
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, OrderStatusUpdateDto statusUpdateDto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            var oldStatus = order.Status;
            var newStatus = statusUpdateDto.Status;

            // Validate status transition
            if (!IsValidStatusTransition(oldStatus, newStatus))
            {
                return BadRequest($"Invalid status transition from {oldStatus} to {newStatus}");
            }

            _mapper.Map(statusUpdateDto, order);

            if (newStatus == OrderStatus.Received || newStatus == OrderStatus.PartiallyReceived)
            {
                order.ReceivedDate = DateTime.UtcNow;
            }

            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/orders/{id}
        /// <summary>
        /// Deletes an order record
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/orders/{id}/items
        /// <summary>
        /// Get order Items
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/items")]
        public async Task<ActionResult<IEnumerable<OrderLineItemDto>>> GetOrderItems(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderLineItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            var itemsDto = _mapper.Map<List<OrderLineItemDto>>(order.OrderLineItems);
            return Ok(itemsDto);
        }

        // GET: api/orders/statuses
        /// <summary>
        /// Gets order status - to populate the frontend dropdown
        /// </summary>
        /// <returns></returns>
        [HttpGet("statuses")]
        public ActionResult<IEnumerable<object>> GetOrderStatuses()
        {
            var statuses = Enum.GetValues(typeof(OrderStatus))
                .Cast<OrderStatus>()
                .Select(s => new
                {
                    Id = (int)s,
                    Name = s.ToString(),
                    DisplayName = GetStatusDisplayName(s)
                })
                .ToList();

            return Ok(statuses);
        }

        // GET: api/orders/units
        /// <summary>
        /// Gets order units to populate unit types dropdown
        /// </summary>
        /// <returns></returns>
        [HttpGet("units")]
        public ActionResult<IEnumerable<object>> GetUnitTypes()
        {
            var units = Enum.GetValues(typeof(UnitType))
                .Cast<UnitType>()
                .Select(u => new
                {
                    Id = (int)u,
                    Name = u.ToString(),
                    DisplayName = GetUnitDisplayName(u)
                })
                .ToList();

            return Ok(units);
        }

        #region
        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }

        private bool IsValidStatusTransition(OrderStatus oldStatus, OrderStatus newStatus)
        {
            var validTransitions = new Dictionary<OrderStatus, List<OrderStatus>>
            {
                [OrderStatus.Draft] = new List<OrderStatus> { OrderStatus.Pending, OrderStatus.Cancelled },
                [OrderStatus.Pending] = new List<OrderStatus> { OrderStatus.Approved, OrderStatus.OnHold, OrderStatus.Cancelled },
                [OrderStatus.Approved] = new List<OrderStatus> { OrderStatus.Ordered, OrderStatus.Cancelled },
                [OrderStatus.Ordered] = new List<OrderStatus> { OrderStatus.Received, OrderStatus.PartiallyReceived, OrderStatus.Cancelled },
                [OrderStatus.OnHold] = new List<OrderStatus> { OrderStatus.Pending, OrderStatus.Cancelled },
                [OrderStatus.PartiallyReceived] = new List<OrderStatus> { OrderStatus.Received }
            };

            if (!validTransitions.ContainsKey(oldStatus))
                return false;

            if (oldStatus == OrderStatus.Received || oldStatus == OrderStatus.Cancelled)
                return false;

            return validTransitions[oldStatus].Contains(newStatus);
        }

        private string GetStatusDisplayName(OrderStatus status)
        {
            return status switch
            {
                OrderStatus.Draft => "Draft",
                OrderStatus.Pending => "Pending Approval",
                OrderStatus.Approved => "Approved",
                OrderStatus.Ordered => "Ordered",
                OrderStatus.Received => "Received",
                OrderStatus.PartiallyReceived => "Partially Received",
                OrderStatus.Cancelled => "Cancelled",
                OrderStatus.OnHold => "On Hold",
                _ => status.ToString()
            };
        }

        private string GetUnitDisplayName(UnitType unit)
        {
            return unit switch
            {
                UnitType.Piece => "Piece",
                UnitType.Kilogram => "Kilogram",
                UnitType.Gram => "Gram",
                UnitType.Liter => "Liter",
                UnitType.Milliliter => "Milliliter",
                UnitType.Meter => "Meter",
                UnitType.Centimeter => "Centimeter",
                UnitType.Box => "Box",
                UnitType.Pack => "Pack",
                UnitType.Pair => "Pair",
                UnitType.Dozen => "Dozen",
                UnitType.Roll => "Roll",
                UnitType.Bottle => "Bottle",
                UnitType.Can => "Can",
                UnitType.Bag => "Bag",
                UnitType.Case => "Case",
                _ => unit.ToString()
            };
        }
#endregion
    }
}