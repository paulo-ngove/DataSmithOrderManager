using StoreOrderAPI.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace StoreOrderAPI.Domain.Dtos
{
    public class OrderDto
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(100)]
        public string SupplierName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? SupplierContact { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required]
        [StringLength(20)]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public DateTime? ExpectedDeliveryDate { get; set; }

        public DateTime? ReceivedDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        public List<OrderLineItemDto> OrderLineItems { get; set; } = new List<OrderLineItemDto>();
    }
}
