namespace StoreOrderAPI.Domain.Enums
{
    public enum OrderStatus
    {
        Draft = 0,
        Pending = 1,
        Approved = 2,
        Ordered = 3,
        Received = 4,
        PartiallyReceived = 5,
        Cancelled = 6,
        OnHold = 7
    }
}
