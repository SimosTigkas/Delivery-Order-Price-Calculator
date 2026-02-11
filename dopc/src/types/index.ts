export type DistanceRange = {
    min: number;
    max: number;
    a: number;
    b: number;
}

export type DeliveryPricing = {
    basePrice: number;
    distanceRanges: DistanceRange[];
}

export type VenueLocation = {
    longitude: number;
    latitude: number
};

export type OrderInfo = {
    orderMinimumNoSurcharge: number;
    pricing: DeliveryPricing
};

export type VenueData = {location: VenueLocation, orderInfo: OrderInfo};

export type CalculationResult = {cartValue: number, smallOrderSurcharge: number, deliveryFee: number, deliveryDistance: number, totalPrice: number};

export type FieldErrors = {
  cartValue?: string;
  userLat?: string;
  userLong?: string;
};

export type PersistedCalculation = {cartValue: string, userLat: string, userLong: string;};
