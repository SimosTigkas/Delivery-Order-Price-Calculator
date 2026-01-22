# Delivery Order Price Calculator

A small React application that calculates a delivery order price based on cart value, user location, and venue-specific delivery pricing.

## Getting started

Install dependencies:

npm install

Start the development server:

npm run dev

The application will be available at http://localhost:5173

## How it works

- Venue data (location and delivery pricing) is fetched from the provided static and dynamic venue APIs.
- Venue data is fetched once and cached in component state to avoid unnecessary network requests.
- User inputs:
  - Cart value (EUR)
  - User latitude
  - User longitude
- The application calculates:
  - Delivery distance
  - Small order surcharge
  - Delivery fee
  - Total price

## Assumptions

- Cart value input is provided in euros and converted internally to cents.
- Delivery is not possible if the calculated distance does not fall within any pricing range.
- The venue slug is fixed to `home-assignment-venue-helsinki` as required by the assignment.

## Error handling

- Invalid or missing user input results in a clear error message.
- Network or API failures are handled gracefully and displayed to the user.
- Delivery is rejected if the distance exceeds the supported delivery ranges.

## Technical notes

- Built with React and TypeScript.
- Business logic is separated into domain modules.
- No external state management libraries were used due to the small scope of the application.
