import { describe, expect, test } from "vitest";
import { calculateDistanceMeters } from "../utils/distance";

describe("calculateDistanceMeters", () => {
    test("returns a reasonable straight-line distance between two points", () => {
        const distance = calculateDistanceMeters(60.1699, 24.9384, 60.2055, 24.6559);
        expect(distance).toBeGreaterThan(10000);
        expect(distance).toBeLessThan(30000);
    });
    test("returns zero for identical coordinates", () => {
        const distance = calculateDistanceMeters(60.1699, 24.9384, 60.1699, 24.9384);
        expect(distance).toBe(0);
    });
});