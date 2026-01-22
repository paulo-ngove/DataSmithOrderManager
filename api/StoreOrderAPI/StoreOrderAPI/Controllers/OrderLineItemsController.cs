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
    public class OrderLineItemsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public OrderLineItemsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/orderlineitems
        /// <summary>
        /// Get order line items
        /// </summary>
        /// <param name="orderId"></param>
        /// <param name="productName"></param>
        /// <param name="productCode"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderLineItemDto>>> GetOrderLineItems(
            [FromQuery] int? orderId = null,
            [FromQuery] string? productName = null,
            [FromQuery] string? productCode = null)
        {
            var query = _context.OrderLineItems
                .Include(i => i.Order)
                .AsQueryable();

            if (orderId.HasValue)
            {
                query = query.Where(i => i.OrderId == orderId.Value);
            }

            if (!string.IsNullOrEmpty(productName))
            {
                query = query.Where(i => i.ProductName.Contains(productName));
            }

            if (!string.IsNullOrEmpty(productCode))
            {
                query = query.Where(i => i.ProductCode != null && i.ProductCode.Contains(productCode));
            }

            var items = await query
                .OrderByDescending(i => i.Id)
                .ProjectTo<OrderLineItemDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/orderlineitems/{id}
        /// <summary>
        /// Get order line item by Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderLineItemDto>> GetOrderLineItem(int id)
        {
            var item = await _context.OrderLineItems
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            return _mapper.Map<OrderLineItemDto>(item);
        }

        // POST: api/orderlineitems
        /// <summary>
        /// Creates a new order item
        /// </summary>
        /// <param name="createItemDto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<OrderLineItemDto>> CreateOrderLineItem(CreateOrderLineItemDto createItemDto)
        {
            var order = await _context.Orders.FindAsync(createItemDto.OrderId);
            if (order == null)
            {
                return NotFound($"Order with ID {createItemDto.OrderId} not found.");
            }

            var item = _mapper.Map<OrderLineItem>(createItemDto);
            item.OrderId = createItemDto.OrderId;

            _context.OrderLineItems.Add(item);

            order.TotalAmount += item.LineTotal;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var itemDto = _mapper.Map<OrderLineItemDto>(item);
            return CreatedAtAction(nameof(CreateOrderLineItem), new { id = item.Id }, itemDto);
        }

        // PUT: api/orderlineitems/{id}
        /// <summary>
        /// Updates order line
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updateItemDto"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderLineItem(int id, UpdateOrderLineItemDto updateItemDto)
        {
            var item = await _context.OrderLineItems
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            var oldLineTotal = item.LineTotal;

            _mapper.Map(updateItemDto, item);

            if (item.Order != null && item.LineTotal != oldLineTotal)
            {
                item.Order.TotalAmount = item.Order.TotalAmount - oldLineTotal + item.LineTotal;
                item.Order.UpdatedAt = DateTime.UtcNow;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderLineItemExists(id))
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

        // PATCH: api/orderlineitems/{id}
        /// <summary>
        /// Partially updates an order line item
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updateItemDto"></param>
        /// <returns></returns>
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchOrderLineItem(int id, UpdateOrderLineItemDto updateItemDto)
        {
            var item = await _context.OrderLineItems
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            var oldLineTotal = item.LineTotal;

            _mapper.Map(updateItemDto, item);

            if (item.Order != null && item.LineTotal != oldLineTotal)
            {
                item.Order.TotalAmount = item.Order.TotalAmount - oldLineTotal + item.LineTotal;
                item.Order.UpdatedAt = DateTime.UtcNow;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderLineItemExists(id))
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

        // DELETE: api/orderlineitems/{id}
        /// <summary>
        /// Delete an order line item item
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderLineItem(int id)
        {
            var item = await _context.OrderLineItems
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            if (item.Order != null)
            {
                item.Order.TotalAmount -= item.LineTotal;
                item.Order.UpdatedAt = DateTime.UtcNow;
            }

            _context.OrderLineItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        #region Private Helpers
        private bool OrderLineItemExists(int id)
        {
            return _context.OrderLineItems.Any(e => e.Id == id);
        }
        #endregion
    }
}