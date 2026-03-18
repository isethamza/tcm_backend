export interface BookingPdfData {
  id: string;
  reference?: string;

  trip: {
    departureCountry: string;
    departureCity: string;
    arrivalCountry: string;
    arrivalCity: string;
  };

  client: {
    firstName: string;
    lastName: string;
    email: string;
  };

  recipientSnapshot: {
    name: string;
    phone: string;
    address: string;
  };

  totalPrice: number;
  prepaidAmount: number;
  remainingAmount: number;
}
