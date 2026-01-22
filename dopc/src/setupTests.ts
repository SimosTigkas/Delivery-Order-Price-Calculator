import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      venue_raw: {
        location: {
          coordinates: [24.93545, 60.16952],
        },
        delivery_specs: {
          order_minimum_no_surcharge: 1000,
          delivery_pricing: {
            base_price: 200,
            distance_ranges: [
                {
                min: 0,
                max: 5000,
                a: 0,
                b: 0,
                flag: null,
                },
            ],
            }
        },
      },
    }),
  } as Response)
));
