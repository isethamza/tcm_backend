export class CreateTripDto {
  departureCountry: string;
  departureCity: string;
  arrivalCountry: string;
  arrivalCity: string;

  departureDate: string;
  arrivalDate: string;

  capacityKg: number;
  capacityM3: number; // ✅ NEW

  pickupAddonFee?: number;

  pricingRules: {
    minKg: number;
    maxKg: number;
    price: number;
  }[];
}
