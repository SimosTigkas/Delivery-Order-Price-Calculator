export function validateField(name: string, value: string): string | null {
    if (name === "cartValue") {
      if (value === "") return "Cart value is required";
      if (isNaN(Number(value))) return "Cart value must be a number";
      if (Number(value) < 0) return "Cart value cannot be negative";
      if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Cart value must have at most two decimals";
    }
    
     if (name === "userLat") {
      if (value === "") return "Latitude is required";
      if (isNaN(Number(value))) return "Latitude must be numeric";
      if (Number(value) < -90 || Number(value) > 90) return "Latitude must be between -90 and 90";
    }

    if (name === "userLong") {
      if (value === "") return "Longitude is required";
      if (isNaN(Number(value))) return "Longitude must be numeric";
      if (Number(value) < -180 || Number(value) > 180) return "Longitude must be between -180 and 180";
    }
    return null;
}