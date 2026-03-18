export type PdfLang = 'en' | 'fr' | 'de' | 'ar';

export const BOOKING_PDF_I18N: Record<
  PdfLang,
  {
    title: string;
    bookingId: string;
    trip: string;
    client: string;
    recipient: string;
    pricing: string;
    total: string;
    paid: string;
    remaining: string;
    footer: string;
    paidWatermark: string;
    unpaidWatermark: string;

    parcels: string;
    parcel: string;
    pickup: string;
    delivery: string;
    option: string;
    name: string;
    phone: string;
    address: string;
    hub: string;
    openingHours: string;
    insurance: string;
    declaredValue: string;
    coverage: string;
    premium: string;
  }
> = {
  en: {
    title: 'Booking Confirmation',
    bookingId: 'Booking ID',
    trip: 'Trip',
    client: 'Client',
    recipient: 'Recipient',
    pricing: 'Pricing',
    total: 'Total',
    paid: 'Paid',
    remaining: 'Remaining',
    footer:
      'This document is automatically generated and valid without signature.',
    paidWatermark: 'PAID',
    unpaidWatermark: 'PAY AT PICKUP / DROP OFF',

    parcels: 'Parcels',
    parcel: 'Parcel',
    pickup: 'Pickup',
    delivery: 'Delivery',
    option: 'Option',
    name: 'Name',
    phone: 'Phone',
    address: 'Address',
    hub: 'Hub',
    openingHours: 'Opening hours',
    insurance: 'Insurance',
    declaredValue: 'Declared value',
    coverage: 'Coverage',
    premium: 'Premium',
  },

  de: {
    title: 'Buchungsbestätigung',
    bookingId: 'Buchungsnummer',
    trip: 'Reise',
    client: 'Kunde',
    recipient: 'Empfänger',
    pricing: 'Preis',
    total: 'Gesamt',
    paid: 'Bezahlt',
    remaining: 'Offen',
    footer:
      'Dieses Dokument wird automatisch erstellt und ist ohne Unterschrift gültig.',
    paidWatermark: 'BEZAHLT',
    unpaidWatermark: 'ZAHLUNG BEI ABHOLUNG / LIEFERUNG',

    parcels: 'Pakete',
    parcel: 'Paket',
    pickup: 'Abholung',
    delivery: 'Lieferung',
    option: 'Option',
    name: 'Name',
    phone: 'Telefon',
    address: 'Adresse',
    hub: 'Hub',
    openingHours: 'Öffnungszeiten',
    insurance: 'Versicherung',
    declaredValue: 'Deklarierter Wert',
    coverage: 'Deckung',
    premium: 'Prämie',
  },

  fr: {
    title: 'Confirmation de réservation',
    bookingId: 'Réservation',
    trip: 'Trajet',
    client: 'Client',
    recipient: 'Destinataire',
    pricing: 'Tarification',
    total: 'Total',
    paid: 'Payé',
    remaining: 'Restant',
    footer:
      'Ce document est généré automatiquement et valide sans signature.',
    paidWatermark: 'PAYÉ',
    unpaidWatermark: 'PAIEMENT À LA REMISE',

    parcels: 'Colis',
    parcel: 'Colis',
    pickup: 'Ramassage',
    delivery: 'Livraison',
    option: 'Option',
    name: 'Nom',
    phone: 'Téléphone',
    address: 'Adresse',
    hub: 'Centre',
    openingHours: 'Heures d’ouverture',
    insurance: 'Assurance',
    declaredValue: 'Valeur déclarée',
    coverage: 'Couverture',
    premium: 'Prime',
  },

  ar: {
    title: 'تأكيد الحجز',
    bookingId: 'رقم الحجز',
    trip: 'الرحلة',
    client: 'المرسل',
    recipient: 'المستلم',
    pricing: 'التسعير',
    total: 'الإجمالي',
    paid: 'المدفوع',
    remaining: 'المتبقي',
    footer: 'هذه الوثيقة صالحة بدون توقيع.',
    paidWatermark: 'مدفوع',
    unpaidWatermark: 'الدفع عند التسليم',

    parcels: 'طرود',
    parcel: 'طرد',
    pickup: 'استلام',
    delivery: 'توصيل',
    option: 'خيار',
    name: 'الاسم',
    phone: 'الهاتف',
    address: 'العنوان',
    hub: 'المركز',
    openingHours: 'ساعات العمل',
    insurance: 'تأمين',
    declaredValue: 'القيمة المصرح بها',
    coverage: 'التغطية',
    premium: 'القسط',
  },
};