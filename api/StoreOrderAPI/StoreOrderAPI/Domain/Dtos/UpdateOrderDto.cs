using System.ComponentModel.DataAnnotations;

namespace StoreOrderAPI.Domain.Dtos
{
    public class UpdateOrderDto
    {
        [StringLength(20)]
        public string? Status { get; set; }

        public DateTime? ReceivedDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
