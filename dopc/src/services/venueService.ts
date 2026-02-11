import type { VenueData } from "../types";
export class VenueFetchError extends Error {}

export async function fetchVenueDetails(venueName: string): Promise<VenueData> {
    // setIsFetchingVenue(true);
    // setVenueError(null);
    // try {
      const staticData = await fetch(`https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/${venueName}/static`);
      if (!staticData.ok) throw new VenueFetchError();
      const staticJson = await staticData.json();
      const [longitude, latitude] = staticJson.venue_raw.location.coordinates;
      const dynamicData = await fetch(`https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/${venueName}/dynamic`);
      if (!dynamicData.ok)
        throw new VenueFetchError();
      const dynamicDataJson = await dynamicData.json();
      const specs = dynamicDataJson.venue_raw.delivery_specs;
      return {
        location: {latitude, longitude},
        orderInfo: {
          orderMinimumNoSurcharge: specs.order_minimum_no_surcharge,
          pricing: {
            basePrice: specs.delivery_pricing.base_price,
            distanceRanges: specs.delivery_pricing.distance_ranges
          },
        },
      };
    // }
    // catch (e) {
    //   setVenueError("Failed to load venue data. Please try again.");
    //   throw e;
    // }
    // finally {
    //   setIsFetchingVenue(false);
    // }
  }