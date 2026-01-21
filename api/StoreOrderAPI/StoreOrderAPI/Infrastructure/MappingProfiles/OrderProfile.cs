using AutoMapper;
using StoreOrderAPI.Domain.Dtos;
using StoreOrderAPI.Domain.Models;

namespace StoreOrderAPI.Infrastructure.MappingProfiles
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.OrderLineItems,
                    opt => opt.MapFrom(src => src.OrderLineItems));

            CreateMap<CreateOrderDto, Order>()
                .ForMember(dest => dest.OrderNumber,
                    opt => opt.Condition(src => !string.IsNullOrEmpty(src.OrderNumber)))
                .ForMember(dest => dest.OrderLineItems,
                    opt => opt.Ignore())
                .ForMember(dest => dest.TotalAmount,
                    opt => opt.Ignore()) 
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt,
                    opt => opt.Ignore());

            CreateMap<UpdateOrderDto, Order>()
                .ForMember(dest => dest.UpdatedAt,
                    opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null));

            CreateMap<OrderStatusUpdateDto, Order>()
                .ForMember(dest => dest.UpdatedAt,
                    opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.Notes,
                    opt => opt.MapFrom((src, dest) =>
                        string.IsNullOrEmpty(dest.Notes)
                            ? src.Notes
                            : $"{dest.Notes}\n[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] Status update: {src.Notes}"));

            CreateMap<OrderDto, Order>()
                .ForMember(dest => dest.OrderLineItems,
                    opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt,
                    opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
}
