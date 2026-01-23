export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateInputs(
  cartValue: number,
  latitude: number,
  longitude: number
): ValidationResult {

  if (Number.isNaN(cartValue) || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return { ok: false, message: 'Invalid input' };
  }

  if (Number(cartValue) == 0 || Number(latitude) == 0 || Number(longitude) == 0) {
    return { ok: false, message: 'Please fill in all fields' };
  }

  if (cartValue <= 0) {
    return { ok: false, message: 'Cart value must be positive' };
  }

  if (latitude < -90 || latitude > 90) {
    return { ok: false, message: 'Latitude must be between -90 and 90' };
  }

  if (longitude < -180 || longitude > 180) {
    return { ok: false, message: 'Longitude must be between -180 and 180' };
  }

  return { ok: true };
}
