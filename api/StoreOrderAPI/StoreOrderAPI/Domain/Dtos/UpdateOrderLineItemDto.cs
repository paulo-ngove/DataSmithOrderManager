using StoreOrderAPI.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace StoreOrderAPI.Domain.Dtos
{
    public class UpdateOrderLineItemDto
    {
        [StringLength(100)]
        public string? ProductName { get; set; }

        [StringLength(50)]
        public string? ProductCode { get; set; }

        [StringLength(250)]
        public string? Description { get; set; }

        [Range(0.001, double.MaxValue)]
        public decimal? Quantity { get; set; }

        [StringLength(20)]
        public string? Unit { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? UnitPrice { get; set; }
    }
}
