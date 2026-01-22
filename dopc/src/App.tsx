import { useState } from "react";
import { calculateDeliveryFee, calculateSmallOrderSurcharge } from "./domain/pricing";
import { calculateDistanceMeters } from "./domain/distance";
import type { DeliveryPricing } from "./domain/pricing";
import { validateInputs } from "./domain/validateInputs";

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

type CalculationResult = {
  cartValue: number;
  smallOrderSurcharge: number;
  deliveryFee: number;
  deliveryDistance: number;
  totalPrice: number;
};



export function App() {
  const [venueDetails, setVenueDetails] = useState<VenueData | null>(null);
  const [cartValue, setCartValue] = useState("");
  const [userLat, setUserLat] = useState("");
  const [userLong, setUserLong] = useState("");

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<null | string>(null);

  async function fetchVenueDetails(): Promise<VenueData> {
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
      const cartValueInCents = Math.round(Number(cartValue) * 100);
      const userLatitude = Number(userLat);
      const userLongitude = Number(userLong);
      const result = validateInputs(cartValueInCents, userLatitude, userLongitude);
      if (!result.ok) {
        setError(result.message);
        setResult(null);
        return;
      }
      const venue = venueDetails ?? await fetchVenueDetails();
      if (!venueDetails)
        setVenueDetails(venue);
      const smallOrderSurcharge = calculateSmallOrderSurcharge(cartValueInCents, venue.orderInfo.orderMinimumNoSurcharge);
      const deliveryDistance = calculateDistanceMeters(userLatitude, userLongitude, venue.location.latitude, venue.location.longitude);
      const deliveryFee = calculateDeliveryFee(deliveryDistance, venue.orderInfo.pricing);

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
        setError("Invalid input");
      }
      setResult(null);
    }
  }
  return (<div className="App">
    <div className="content">
    <h1 data-testid="deliveryOrderPriceCalculator">Delivery Order Price Calculator</h1>
    <h2 data-testid="details">Details</h2>
    <div className="inputs">
        <div className="input-group">
          <label>Venue slug</label>
          <input type="text" data-testid="venueSlug" value="home-assignment-venue-helsinki" readOnly/>
        </div>
        <div className="input-group">
          <label>Cart Value (EUR)</label>
          <input type="number" data-testid="cartValue" value={cartValue} onChange={e => setCartValue(e.target.value)} />
        </div>
        <div className="input-group">
          <label>User latitude </label>
          <input type="number" data-testid="userLatitude" value={userLat} onChange={e => setUserLat(e.target.value)} />
        </div>
        <div className="input-group">
          <label>User longitude </label>
          <input type="number" data-testid="userLongitude" value={userLong} onChange={e => setUserLong(e.target.value)} />
        </div>
    </div>
    <button data-testid="calculateDeliveryPrice" onClick={calculationHandler}>Calculate delivery price</button>
      <div className="output">
      {result && (
        <div className="results">
          <span data-testid="cartValue" data-raw-value={result.cartValue}>Cart Value: {(result.cartValue / 100).toFixed(2)}€</span>
          <span> / </span>
          <span data-testid="deliveryFee" data-raw-value={result.deliveryFee}>Delivery fee: {(result.deliveryFee / 100).toFixed(2)}€</span>
          <span> / </span>
          <span data-testid="deliveryDistance" data-raw-value={result.deliveryDistance}>Delivery distance: {result.deliveryDistance}m</span>
          <span> / </span>
          <span data-testid="smallOrderSurcharge" data-raw-value={result.smallOrderSurcharge}>Small order surcharge: {(result.smallOrderSurcharge / 100).toFixed(2)}€</span>
          <span> / </span>
          <span data-testid="totalPrice" data-raw-value={result.totalPrice}>Total price: {(result.totalPrice / 100).toFixed(2)}€</span>
        </div>
      )}
      <div className="error">{error && <span data-testid="error">{error}</span>}</div>
    </div>
    </div>
  </div>
  );
}

export default App;