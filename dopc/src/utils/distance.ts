const R = 6371000;
const toRadians = (degrees: number) => degrees * Math.PI / 180;

export function calculateDistanceMeters(userLat: number, userLong: number, venueLat: number, venueLong: number): number {
    const dLat = toRadians(venueLat - userLat);
    const dLon = toRadians(venueLong - userLong);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(userLat)) * Math.cos(toRadians(venueLat)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}