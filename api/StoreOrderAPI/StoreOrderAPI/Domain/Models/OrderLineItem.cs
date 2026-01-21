using StoreOrderAPI.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreOrderAPI.Domain.Models
{
    public class OrderLineItem
    {
        [Key]
        public int Id { get; set; }

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
        [Column(TypeName = "decimal(10,3)")]
        public decimal Quantity { get; set; }

        [Required]
        [StringLength(20)]
        public UnitType Unit { get; set; } = UnitType.Piece;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }

        // Navigation property
        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }
    }
}
