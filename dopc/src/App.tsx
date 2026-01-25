import { useEffect, useState } from "react";
import { calculateDeliveryFee, calculateSmallOrderSurcharge } from "./domain/pricing";
import { calculateDistanceMeters } from "./domain/distance";
import type { DeliveryPricing } from "./domain/pricing";


export type VenueLocation = {longitude: number, latitude: number};
export type OrderInfo = {orderMinimumNoSurcharge: number, pricing: DeliveryPricing};
export type VenueData = {location: VenueLocation, orderInfo: OrderInfo};
type CalculationResult = {cartValue: number, smallOrderSurcharge: number, deliveryFee: number, deliveryDistance: number, totalPrice: number};
type FieldErrors = {cartValue?: string, userLat?: string, userLong?: string;};

export function App() {
  const [venueDetails, setVenueDetails] = useState<VenueData | null>(null);
  const [cartValue, setCartValue] = useState("");
  const [userLat, setUserLat] = useState("");
  const [userLong, setUserLong] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  function validateField(name: string, value: string) {
    if (value === "") return "This field is required";
    if (name === "cartValue" && isNaN(Number(value))) return "Cart value must be a number";
     if (name === "cartValue" && Number(value) < 0) return "Cart value cannot be negative";
    if ((name === "userLat" || name === "userLong") && isNaN(Number(value)))
      return "Coordinates must be numeric";
    if (name === "userLat" && (Number(value) < -90 || Number(value) > 90))
      return "Latitude must be between -90 and 90";
    if (name === "userLong" && (Number(value) < -180 || Number(value) > 180))
      return "Longitude must be between -180 and 180";
    return "";
  }

   const isFormValid = () => {
    for (const key in errors) {
      if (errors[key as keyof typeof errors]) return false;
    }
    return cartValue !== "" && userLat !== "" && userLong !== "";
  };

  async function fetchVenueDetails(): Promise<VenueData> {
    const venueName = "home-assignment-venue-helsinki";
    try {
      const staticData = await fetch(`https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/${venueName}/static`);
      if (!staticData.ok) throw new Error("Network response was not ok");
      const staticJson = await staticData.json();
      const [longitude, latitude] = staticJson.venue_raw.location.coordinates;
      const dynamicData = await fetch(`https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues/${venueName}/dynamic`);
      if (!dynamicData.ok)
        throw new Error("Network response was not ok");
      const dynamicDataJson = await dynamicData.json();
      const specs = dynamicDataJson.venue_raw.delivery_specs;
      return {
        location: {latitude, longitude},
        orderInfo: {
          orderMinimumNoSurcharge: specs.order_minimum_no_surcharge,
          pricing: {
            basePrice: specs.delivery_pricing.base_price,
            distanceRanges: specs.delivery_pricing.distance_ranges
          }
        }
      };
    }
    catch {
      throw new Error("Failed to fetch venue details");
    }
  }

  const handleChange = (field: string, value: string) => {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    switch (field) {
      case "cartValue":
        setCartValue(value);
        break;
      case "userLat":
        setUserLat(value);
        break;
      case "userLong":
        setUserLong(value);
        break;
    }
  };

  function getUserLocation() {
  if (!navigator.geolocation) {
    setLocationError("Geolocation is not supported by your browser");
    return;
  }
  setIsGettingLocation(true);
  setLocationError(null);
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      handleChange("userLat", latitude.toString());
      handleChange("userLong", longitude.toString());
      setIsGettingLocation(false);
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError("Location permission denied. Click the lock icon in the address bar to enable location access.");
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationError("Location information is unavailable");
          break;
        case error.TIMEOUT:
          setLocationError("Location request timed out");
          break;
        default:
          setLocationError("Failed to retrieve location");
      }
      setIsGettingLocation(false);
    }
  );
}


  async function calculationHandler() {
    if (!isFormValid()) return;
    setResult(null);
    setIsAnimating(true);
    try {
      const venue = venueDetails ?? await fetchVenueDetails();
      const start = Date.now();
      const cartValueInCents = Math.round(Number(cartValue) * 100);
      const userLatitude = Number(userLat);
      const userLongitude = Number(userLong);
      
      setCalculationError(null);
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
      const elapsed = Date.now() - start;
      if (elapsed < 500)
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
    }
    catch (e) {
      console.log(e);
      setCalculationError("Delivery is not available for this distance");
      setResult(null);
    }
    finally {
      setIsAnimating(false);
    }
  }

  useEffect(() => {
    if (!calculationError) return;

    const timer = setTimeout(() => {
      setCalculationError(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [calculationError]);


  function Spinner() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: 11,
        height: 11,
        border: "2px solid white",
        borderRightColor: "transparent",
        borderRadius: "50%",
        marginRight: 8,
        animation: "spin 0.8s linear infinite",
        justifyContent: "center"
      }}
    />
  );
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
          <input type="number" data-testid="cartValue" value={cartValue} onChange={e => {handleChange("cartValue", e.target.value); validateField("cartValue", e.target.value);}} />
        </div>
        <div className="input-group">
          <label>User latitude </label>
          <input type="number" data-testid="userLatitude" value={userLat} onChange={e => {handleChange("userLat", e.target.value); validateField("latitude", e.target.value);}} />
        </div>
        <div className="input-group">
          <label>User longitude </label>
          <input type="number" data-testid="userLongitude" value={userLong} onChange={e => {handleChange("userLong", e.target.value); validateField("longitude", e.target.value);}} />
        </div>
        <div className="button-group">
          <button data-testid="getUserLocation" onClick={getUserLocation} disabled={isGettingLocation || isAnimating}>{isGettingLocation ? (<><Spinner /></>) : ("Get location")}</button>
          <button data-testid="calculateDeliveryPrice" onClick={calculationHandler} disabled={isAnimating || !isFormValid()}>{isAnimating ? (<><Spinner /></>) : ("Calculate delivery price")}</button>
        </div>
    </div>
    <div className="output">
      {!isAnimating &&result && (
        <div className="results">
          <span data-testid="cartValue" data-raw-value={result.cartValue}>Cart Value: {(result.cartValue / 100).toFixed(2)}€</span>
          <span data-testid="deliveryFee" data-raw-value={result.deliveryFee}>/ Delivery fee: {(result.deliveryFee / 100).toFixed(2)}€</span>
          <span data-testid="deliveryDistance" data-raw-value={result.deliveryDistance}>/ Delivery distance: {result.deliveryDistance}m</span>
          <span data-testid="smallOrderSurcharge" data-raw-value={result.smallOrderSurcharge}>/ Small order surcharge: {(result.smallOrderSurcharge / 100).toFixed(2)}€</span>
          <span data-testid="totalPrice" data-raw-value={result.totalPrice}>/ Total price: {(result.totalPrice / 100).toFixed(2)}€</span>
        </div>
      )}
      {errors.cartValue && <span className="error">{errors.cartValue}</span>}
      {errors.userLat && <span className="error">{errors.userLat}</span>}
      {errors.userLong && <span className="error">{errors.userLong}</span>}
      {locationError && <span className="error">{locationError}</span>}
      {calculationError && (<div className="error" data-testid="error">{calculationError}</div>)}
    </div>
    </div>
  </div>
  );
}

export default App;