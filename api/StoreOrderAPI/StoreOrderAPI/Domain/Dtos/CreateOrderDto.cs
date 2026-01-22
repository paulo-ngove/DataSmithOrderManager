using System.ComponentModel.DataAnnotations;

namespace StoreOrderAPI.Domain.Dtos
{

    public class CreateOrderDto
    {
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(100)]
        public string SupplierName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? SupplierContact { get; set; }

        public DateTime? ExpectedDeliveryDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one order line item is required")]
        public List<CreateOrderLineItemDto> OrderLineItems { get; set; } = new List<CreateOrderLineItemDto>();
    }
}
