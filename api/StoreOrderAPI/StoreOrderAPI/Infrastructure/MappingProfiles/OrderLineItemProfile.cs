using AutoMapper;
using StoreOrderAPI.Domain.Dtos;
using StoreOrderAPI.Domain.Enums;
using StoreOrderAPI.Domain.Models;
using StoreOrderAPI.Infrastructure.Utilities;

namespace StoreOrderAPI.Infrastructure.MappingProfiles
{
    public class OrderLineItemProfile : Profile
    {
        public OrderLineItemProfile()
        {
            CreateMap<OrderLineItem, OrderLineItemDto>();

            CreateMap<CreateOrderLineItemDto, OrderLineItem>()
                .ForMember(dest => dest.Unit, 
                opt => opt.MapFrom(src => EnumHelper.GetUnitFromDisplayName(src.Unit)))
                .ForMember(dest => dest.LineTotal,
                    opt => opt.MapFrom(src => src.Quantity * src.UnitPrice));

            CreateMap<UpdateOrderLineItemDto, OrderLineItem>()
                .ForMember(dest => dest.Unit,
                opt => opt.MapFrom(src => EnumHelper.GetUnitFromDisplayName(src.Unit ?? UnitType.Piece.ToString())))
                .ForMember(dest => dest.LineTotal,
                    opt => opt.MapFrom((src, dest, destMember, context) =>
                    {
                        var quantity = src.Quantity ?? dest.Quantity;
                        var unitPrice = src.UnitPrice ?? dest.UnitPrice;
                        return quantity * unitPrice;
                    }))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null));
        }
    }
}
