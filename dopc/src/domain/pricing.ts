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

export function calculateSmallOrderSurcharge(cartValue: number, orderMinimumNoSurcharge: number): number {
    return Math.max(0, orderMinimumNoSurcharge - cartValue);
}

export function calculateDeliveryFee(distanceInMeters: number, pricing: DeliveryPricing): number {
    const range = pricing.distanceRanges.find(r => distanceInMeters >= r.min && (r.max !== 0 && distanceInMeters < r.max));
    if (!range)
      throw new Error("Delivery not possible for this distance");
    return pricing.basePrice + range.a + Math.round(range.b * distanceInMeters/10);
}
