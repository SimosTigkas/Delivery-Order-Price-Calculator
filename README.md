# Delivery Order Price Calculator

A React + TypeScript web application that calculates a delivery order price based on cart value, user location and venue-specific delivery pricing rules. The main emphasis is on correctness, predictable UI behavior and production-grade asynchronous state handling.

## Features

- Fetches venue location and delivery pricing from the provided static and dynamic APIs
- Calculates:
  - Delivery distance
  - Small order surcharge
  - Delivery fee
  - Total order price
- Browser geolocation support via a **Get location** button
- Explicit loading, success, and error states for all asynchronous processes
- Centralized validation logic reused across manual input and programmatic updates
- Persistence of the last successful calculation using `localStorage`

## Getting started
#### Installation
```bash
npm install
```
#### Development
```
npm run dev
```
The application will be available at http://localhost:5173

## How it works
#### Venue Data Fetching
- Venue data (location and delivery pricing) is fetched from APIs.
- Venue data is fetched once and cached in component state to avoid unnecessary network requests.
- Loading and error states are explicitly handled to ensure clear user feedback.

#### User input
The user provides:
  - Cart value (EUR)
  - User latitude
  - User longitude
Alternatively, latitude and longitude can be populated automatically using browser geolocation.

#### Price Calculation
- Cart value is converted internally from euros to cents.
- Delivery distance is calculated using venue and user coordinates.
- Delivery eligibility and fees are determined using venue-specific pricing ranges.
- If delivery is not supported for the calculated distance, an appropriate error is displayed.

#### Asynchronous State Management
The application coordinates three independent asynchronous processes:
1. Venue data fetching
2. Browser geolocation
3. Delivery price calculation
Each process has clearly defined loading, success and error states to prevent race conditions and avoid ambiguous UI behavior.

#### Validation and Error Handling
All validation rules are defined in a single place.
Validation is applied consistently to both user-driven input and automatic updates (such as geolocation).
Errors are displayed in a dedicated error area to maintain layout stability and clarity.
Network failures, invalid input, and unsupported delivery distances are handled gracefully.

#### State Persistence
The last successful calculation is stored in localStorage.
On page reload, inputs and results are restored safely when valid.
This allows users to continue from where they left off without re-entering all values.

## Assumptions
Cart value is provided in euros and converted internally to cents.
Delivery is rejected if the calculated distance does not fall within any supported pricing range.
The venue slug is fixed to home-assignment-venue-helsinki.

## Technical Notes
Built with React and TypeScript
Business logic separated into domain-specific modules
Focus on deterministic UI behavior and production-level error handling rather than minimal implementation
