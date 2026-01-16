import { useState } from "react";
import { calculateDeliveryFee, calculateSmallOrderSurcharge } from "./domain/pricing";
import { calculateDistanceMeters } from "./domain/distance";
import type { DeliveryPricing } from "./domain/pricing";

export type VenueLocation = {
  longitude: number,
  latitude: number
};

export type OrderInfo = {
  orderMinimumNoSurcharge: number,
  pricing: DeliveryPricing
}
export type VenueData = {
  location: VenueLocation
  orderInfo: OrderInfo
};


export function App() {
  const [cartValue, setCartValue] = useState("");
  const [userLat, setUserLat] = useState("");
  const [userLong, setUserLong] = useState("");

  const [result, setResult] = useState<null | {
      cartValue: number;
      smallOrderSurcharge: number;
      deliveryFee: number;
      deliveryDistance: number;
      totalPrice: number;
  }>(null);

  const [error, setError] = useState<null | string>(null);

  async function getVenueDetails(): Promise<VenueData> {
    const venueName = "home-assignment-venue-helsinki";
    try {
      const staticData = await fetch(`https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/${venueName}/static`);
      if (!staticData.ok) {
        throw new Error("Network response was not ok");
      }
      const staticJson = await staticData.json();
      const [longitude, latitude] = staticJson.venue_raw.location.coordinates;
      const venueCoordinates: VenueLocation = {
        latitude,
        longitude
      };
      const dynamicData = await fetch(`https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/${venueName}/dynamic`);
      if (!dynamicData.ok) {
        throw new Error("Network response was not ok");
      }
      const dynamicDataJson = await dynamicData.json();
      const specs = dynamicDataJson.venue_raw.delivery_specs;
      const order: OrderInfo = {
        orderMinimumNoSurcharge: specs.order_minimum_no_surcharge,
        pricing: {
          basePrice: specs.delivery_pricing.base_price,
          distanceRanges: specs.delivery_pricing.distance_ranges
        }
      };
      const venueSlug: VenueData = {
        location: venueCoordinates,
        orderInfo: order
      };
      return venueSlug;
    }
    catch {
      throw new Error("Failed to fetch venue details");
    }
  }

  async function calculationHandler() {
    try {
      setError(null);
      const cartValueInCents = Math.round(Number(cartValue.trim()) * 100);
      const userLatitude = Number(userLat);
      const userLongitude = Number(userLong);
      if (isNaN(cartValueInCents) || isNaN(userLatitude) || isNaN(userLongitude))
        throw new Error("Invalid input");
      if (cartValueInCents < 0)
        throw new Error("Cart value must be positive");
      if (userLatitude < -90 || userLatitude > 90)
        throw new Error("Latitude must be between -90 and 90");
      if (userLongitude < -180 || userLongitude > 180)
        throw new Error("Longitude must be between -180 and 180");
      const venueDetails = await getVenueDetails();
      if (!venueDetails) {
        throw new Error("Failed to get venue details");
      }
      const smallOrderSurcharge = calculateSmallOrderSurcharge(cartValueInCents, venueDetails.orderInfo.orderMinimumNoSurcharge);
      const deliveryDistance = calculateDistanceMeters(userLatitude, userLongitude, venueDetails.location.latitude, venueDetails.location.longitude);
      const deliveryFee = calculateDeliveryFee(deliveryDistance, venueDetails.orderInfo.pricing);
      setResult({
        cartValue: cartValueInCents,
        smallOrderSurcharge,
        deliveryFee,
        deliveryDistance,
        totalPrice: cartValueInCents + smallOrderSurcharge + deliveryFee
      });
    }
    catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
      else {
        setError("Delivery is not possible for this distance");
      }
      setResult(null);
    }
  }
  return (<div className="App">
    <div className="content">
    <h1>Delivery Order Price Calculator</h1>
    <h2>Details</h2>
    <div className="inputs">
        <div className="input-group">
          <label>Venue slug</label>
          <input type="text" data-test-id="venueSlug" value="home-assignment-venue-helsinki" readOnly/>
        </div>
        <div className="input-group">
          <label>Cart Value (EUR)</label>
          <input type="number" data-test-id="cartValue" value={cartValue} onChange={e => setCartValue(e.target.value)} />
        </div>
        <div className="input-group">
          <label>User latitude (m) </label>
          <input type="number" data-test-id="userLatitude" value={userLat} onChange={e => setUserLat(e.target.value)} />
        </div>
        <div className="input-group">
          <label>User longitude (m) </label>
          <input type="number" data-test-id="userLongitude" value={userLong} onChange={e => setUserLong(e.target.value)} />
        </div>
    </div>
    <button data-test-id="calculateDeliveryPrice" onClick={calculationHandler}>Calculate delivery price</button>
      <div className="output">
      <div className="error">{error && <span data-test-id="error">{error}</span>}</div>
      {result && (
        <div className="results">
          <span data-test-id="cartValue" data-raw-value={result.cartValue}>Cart Value: {(result.cartValue / 100).toFixed(2)}€</span>
          <span> / </span>
          <span data-test-id="deliveryFee" data-raw-value={result.deliveryFee}>Delivery fee: {(result.deliveryFee / 100).toFixed(2)}€</span>
          <span> / </span>
          <span data-test-id="deliveryDistance" data-raw-value={result.deliveryDistance}>Delivery distance: {result.deliveryDistance}m</span>
          <span> / </span>
          <span data-test-id="smallOrderSurcharge" data-raw-value={result.smallOrderSurcharge}>Small order surcharge: {(result.smallOrderSurcharge / 100).toFixed(2)}€</span>
          <span> / </span>
          <span data-test-id="totalPrice" data-raw-value={result.totalPrice}>Total price: {(result.totalPrice / 100).toFixed(2)}€</span>
        </div>
      )}
    </div>
    </div>
  </div>
  );
}

export default App;