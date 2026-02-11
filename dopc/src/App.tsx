import { useEffect, useState } from "react";
import { calculateDeliveryFee, calculateSmallOrderSurcharge } from "./utils/pricing";
import { calculateDistanceMeters } from "./utils/distance";
import Spinner from "./components/Spinner";
import type { PersistedCalculation, VenueData, CalculationResult, FieldErrors} from "./types";
import { validateField } from "./utils/validation";
import { fetchVenueDetails } from "./services/venueService"
import { VenueFetchError } from "./services/venueService";
import { DeliveryFeeCalculationError } from "./utils/pricing";

const venueName = "home-assignment-venue-helsinki";

export function App() {
  const [venueDetails, setVenueDetails] = useState<VenueData | null>(null);
  const [cartValue, setCartValue] = useState("");
  const [userLat, setUserLat] = useState("");
  const [userLong, setUserLong] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [venueError, setVenueError] = useState<string | null>(null);
  
  const isFormValid = () => {
    for (const key in errors) {
      if (errors[key as keyof typeof errors]) return false;
    }
    return cartValue !== "" && userLat !== "" && userLong !== "";
  };

  const priceFormatter = new Intl.NumberFormat("fi-FI", {style: "currency", currency: "EUR"});

  const handleCartValueChange = (value: string) => {
    if (/^-?\d*\.?\d{0,2}$/.test(value)) {
      setCartValue(value);
      const error = validateField("cartValue", value);
      setErrors((prev) => ({ ...prev, cartValue: validateField("cartValue", value) || undefined}));
      if (error)
        setResult(null);
    }
  };

  const handleCoordinateChange = (field: "userLat" | "userLong", value: string) => {
    if (!/^-?\d*\.?\d*$/.test(value)) return;
    if (field === "userLat") setUserLat(value);
    else setUserLong(value);
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) || undefined}));
    if (error) setResult(null);
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
      handleCoordinateChange("userLat", position.coords.latitude.toFixed(4));
      handleCoordinateChange("userLong", position.coords.longitude.toFixed(4));
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
    setCalculationError(null);
    setVenueError(null);
    try {
      const venue = venueDetails ?? (await fetchVenueDetails(venueName));
      setVenueDetails(venue);
      const start = Date.now();
      const cartValueInCents = Math.round(Number(cartValue) * 100);
      const userLatitude = Number(userLat);
      const userLongitude = Number(userLong);
      const smallOrderSurcharge = calculateSmallOrderSurcharge(cartValueInCents, venue.orderInfo.orderMinimumNoSurcharge);
      const deliveryDistance = calculateDistanceMeters(userLatitude, userLongitude, venue.location.latitude, venue.location.longitude);
      const deliveryFee = calculateDeliveryFee(deliveryDistance, venue.orderInfo.pricing);
      const calculatedResult: CalculationResult = {cartValue: cartValueInCents, smallOrderSurcharge, deliveryFee, deliveryDistance, totalPrice: cartValueInCents + smallOrderSurcharge + deliveryFee};
      setResult(calculatedResult);
      const persisted: PersistedCalculation = {cartValue, userLat, userLong};
      localStorage.setItem("lastCalculation", JSON.stringify(persisted));
      const elapsed = Date.now() - start;
      if (elapsed < 500)
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
    }
    catch (error){
      if (error instanceof DeliveryFeeCalculationError)
        setCalculationError("Delivery is not possible for this distance");
      else if (error instanceof VenueFetchError)
        setVenueError("Failed to load venue data");
      else
        setCalculationError("Calculation failed");
      setResult(null);
    }
    finally {
      setIsAnimating(false);
    }
  }

  useEffect(() => {
    if (!calculationError) 
      {
        setResult(null);
        return;
      }
    const timer = setTimeout(() => {
      setCalculationError(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [calculationError]);

  useEffect(() => {
  const raw = localStorage.getItem("lastCalculation");
  if (!raw) return;
  try {
    const saved = JSON.parse(raw) as PersistedCalculation;
    setCartValue(saved.cartValue);
    setUserLat(saved.userLat);
    setUserLong(saved.userLong);
    setResult(null);
  }
  catch {
    localStorage.removeItem("lastCalculation");
      setCartValue("");
      setUserLat("");
      setUserLong("");
      setResult(null);
  }}, []);

  return (<div className="App">
    <div className="content">
    <h1 data-testid="deliveryOrderPriceCalculator">Delivery Order Price Calculator</h1>
    <h2 data-testid="details">Details</h2>
    <div className="inputs">
        <div className="input-group">
          <label htmlFor="venueSlug">Venue slug</label>
          <input type="text" data-testid="venueSlug" id="venueSlug" value="home-assignment-venue-helsinki" readOnly aria-describedby="venueSlug-hint"/>
          <small id="venueSlug-hint">Fixed venue identifier</small>
        </div>
        <div className="input-group">
          <label htmlFor="cartValue">Cart Value (EUR)</label>
          <input type="text" inputMode="decimal" data-testid="cartValue" id="cartValue" value={cartValue} aria-invalid={!!errors.cartValue} aria-describedby={errors.cartValue ? "cartValue-hint cartValue-error" : "cartValue-hint"} onChange={e => handleCartValueChange(e.target.value)} />
          <small id="cartValue-hint">Enter a positive amount in euros (up to 2 decimal places)</small>
        </div>
        <div className="input-group">
          <label htmlFor="userLatitude">User latitude </label>
          <input type="text" inputMode="decimal" data-testid="userLatitude" id="userLatitude" value={userLat} aria-invalid={!!errors.userLat} aria-describedby={errors.userLat ? "userLat-hint userLat-error" : "userLat-hint"} onChange={e => handleCoordinateChange("userLat", e.target.value)} />
          <small id="userLat-hint">Latitude must be a number between -90 and 90</small>
        </div>
        <div className="input-group">
          <label htmlFor="userLongitude">User longitude </label>
          <input type="text" inputMode="decimal" data-testid="userLongitude" id="userLongitude" value={userLong} aria-invalid={!!errors.userLong} aria-describedby={errors.userLong ? "userLong-hint userLong-error" : "userLong-hint"} onChange={e => handleCoordinateChange("userLong", e.target.value)} />
          <small id="userLong-hint">Longitude must be a number between -180 and 180</small>
        </div>
        <div className="button-group">
          <button data-testid="getUserLocation" onClick={getUserLocation} disabled={isGettingLocation || isAnimating} aria-busy={isGettingLocation} aria-label={isGettingLocation ? "Getting user location" : "Get location"}>{isGettingLocation ? (<><Spinner/>Loading..</>) : ("Get location")}</button>
          <button data-testid="calculateDeliveryPrice" onClick={calculationHandler} disabled={isAnimating || !isFormValid()} aria-busy={isAnimating} aria-label={isAnimating ? "Calculating delivery price" : "Calculate delivery price"}>{isAnimating ? (<><Spinner />Loading..</>) : ("Calculate delivery price")}</button>
        </div>
    </div>
    <div className="output">
      <div role="status" aria-live="polite" aria-atomic="true" className="results">
      {!isAnimating && result ? (
        <>
          <p>
            Cart Value: {priceFormatter.format(result.cartValue / 100)},
            Delivery fee: {priceFormatter.format(result.deliveryFee / 100)},
            Delivery distance: {result.deliveryDistance}m,
            Small order surcharge: {priceFormatter.format(result.smallOrderSurcharge / 100)},
            Total price: {priceFormatter.format(result.totalPrice / 100)}
          </p>
        </>
        ) : (null)}
      </div>
      <div className="errorGroup" aria-live="assertive" aria-atomic="true">
        {venueError && <div className="error">{venueError}</div>}
        {errors.cartValue && <span id="cartValue-error" className="error">{errors.cartValue}</span>}
        {errors.userLat && <span id="userLat-error" className="error">{errors.userLat}</span>}
        {errors.userLong && <span id="userLong-error" className="error">{errors.userLong}</span>}
        {locationError && <span id="location-error" className="error">{locationError}</span>}
        {calculationError && (<div className="error" data-testid="error">{calculationError}</div>)}
      </div>
    </div>
    </div>
  </div>
  );
}

export default App;