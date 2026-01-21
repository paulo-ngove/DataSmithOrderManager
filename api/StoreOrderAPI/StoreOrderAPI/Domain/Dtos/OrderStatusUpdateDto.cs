using StoreOrderAPI.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace StoreOrderAPI.Domain.Dtos
{
    public class OrderStatusUpdateDto
    {
        [Required]
        public OrderStatus Status { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
