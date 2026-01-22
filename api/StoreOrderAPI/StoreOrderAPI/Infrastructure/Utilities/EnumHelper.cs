using StoreOrderAPI.Domain.Enums;

namespace StoreOrderAPI.Infrastructure.Utilities
{
    public static class EnumHelper
    {
        public static UnitType GetUnitFromDisplayName(string displayName)
        {
            return displayName switch
            {
                "Piece" => UnitType.Piece,
                "Kilogram" => UnitType.Kilogram,
                "Gram" => UnitType.Gram,
                "Liter" => UnitType.Liter,
                "Milliliter" => UnitType.Milliliter,
                "Meter" => UnitType.Meter,
                "Centimeter" => UnitType.Centimeter,
                "Box" => UnitType.Box,
                "Pack" => UnitType.Pack,
                "Pair" => UnitType.Pair,
                "Dozen" => UnitType.Dozen,
                "Roll" => UnitType.Roll,
                "Bottle" => UnitType.Bottle,
                "Can" => UnitType.Can,
                "Bag" => UnitType.Bag,
                "Case" => UnitType.Case,
                _ => Enum.TryParse<UnitType>(displayName, true, out var unitType)
                    ? unitType
                    : UnitType.Piece
            };
        }
    }
}
