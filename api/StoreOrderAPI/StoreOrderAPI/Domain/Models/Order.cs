using StoreOrderAPI.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreOrderAPI.Domain.Models
{
    public class Order
    {
        [Key]
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

        [EmailAddress]
        [StringLength(100)]
        public string? SupplierEmail { get; set; }

        [Phone]
        [StringLength(20)]
        public string? SupplierPhone { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public OrderStatus Status { get; set; } = OrderStatus.Draft;

        public DateTime? ExpectedDeliveryDate { get; set; }

        public DateTime? ReceivedDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        [StringLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual ICollection<OrderLineItem> OrderLineItems { get; set; } = new List<OrderLineItem>();
    }
}
