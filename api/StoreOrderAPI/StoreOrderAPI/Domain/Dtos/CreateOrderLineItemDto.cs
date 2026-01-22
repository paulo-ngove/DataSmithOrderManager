using StoreOrderAPI.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace StoreOrderAPI.Domain.Dtos
{
    public class CreateOrderLineItemDto
    {
        [Required]
        public int OrderId { get; set; }
        [Required]
        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? ProductCode { get; set; }

        [StringLength(250)]
        public string? Description { get; set; }

        [Required]
        [Range(0.001, double.MaxValue)]
        public decimal Quantity { get; set; }

        [Required]
        [StringLength(20)]
        public string Unit { get; set; } = UnitType.Piece.ToString();

        [Required]
        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }
    }

}
