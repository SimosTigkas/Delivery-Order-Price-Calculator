import { describe, expect, test } from "vitest";
import {calculateSmallOrderSurcharge, calculateDeliveryFee} from "./pricing";

describe("calculateSmallOrderSurcharge", () => {
  test("returns surcharge when cart value is below minimum", () => {
    expect(calculateSmallOrderSurcharge(800, 1000)).toBe(200);
  });

  test("returns zero when cart value equals minimum", () => {
    expect(calculateSmallOrderSurcharge(1000, 1000)).toBe(0);
  });

  test("returns zero when cart value is above minimum", () => {
    expect(calculateSmallOrderSurcharge(1200, 1000)).toBe(0);
  });
});

describe("calculateDeliveryFee", () => {
  const pricing = {
    basePrice: 200,
    distanceRanges: [
      { min: 0, max: 1000, a: 100, b: 10 },
      { min: 1000, max: 5000, a: 200, b: 5 },
      { min: 5000, max: 0, a: 0, b: 0 }
    ]
  };
  test("calculates delivery fee for valid distance", () => {
    const distance = 1500;
    const result = calculateDeliveryFee(distance, pricing);
    expect(result).toBe(
      200 + 200 + Math.round(5 * 1500 / 10)
    );
  });
  test("throws error when delivery is not possible", () => {
    expect(() =>
      calculateDeliveryFee(6000, pricing)
    ).toThrow();
  });
});
