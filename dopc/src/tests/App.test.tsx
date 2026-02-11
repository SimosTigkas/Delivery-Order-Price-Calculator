import { render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { describe, test, expect } from "vitest";

describe("App – basic rendering", () => {
  test("renders headings", () => {
    render(<App />);
    expect(screen.getByTestId("deliveryOrderPriceCalculator")).toBeInTheDocument();
    expect(screen.getByTestId("details")).toBeInTheDocument();
  });
});

describe("App – successful calculation", () => {
  test("calculates delivery price correctly", async () => {
    render(<App />);
    const user = userEvent.setup();
    const cartInput = screen.getByTestId("cartValue");
    const latInput = screen.getByTestId("userLatitude");
    const longInput = screen.getByTestId("userLongitude");
    const button = screen.getByTestId("calculateDeliveryPrice");
    await user.clear(cartInput);
    await user.type(cartInput, "8.50"); 
    await user.clear(latInput);
    await user.type(latInput, "60.1695"); 
    await user.clear(longInput);
    await user.type(longInput, "24.9354"); 
    await user.click(button);
    const totalPrice = await screen.findByTestId("totalPrice");
    expect(totalPrice).toBeInTheDocument();
    expect(totalPrice).toHaveAttribute("data-raw-value");
  });
});

describe("App – validation errors", () => {
  test("shows error for invalid latitude", async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId("cartValue"), "5");
    await user.type(screen.getByTestId("userLatitude"), "100"); // invalid
    await user.type(screen.getByTestId("userLongitude"), "20");
    await user.click(screen.getByTestId("calculateDeliveryPrice"));
    const error = await screen.findByTestId("error");
    expect(error).toHaveTextContent("Latitude must be between -90 and 90");
  });

  test("shows error for non-numeric cart value", async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId("cartValue"), "abc"); // non-numeric
    await user.type(screen.getByTestId("userLatitude"), "60");
    await user.type(screen.getByTestId("userLongitude"), "25");
    await user.click(screen.getByTestId("calculateDeliveryPrice"));
    const error = await screen.findByTestId("error");
    expect(error).toHaveTextContent("Please fill in all fields");
  });

  test("shows error for negative cart value", async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId("cartValue"), "-10"); // negative
    await user.type(screen.getByTestId("userLatitude"), "60");
    await user.type(screen.getByTestId("userLongitude"), "25");
    await user.click(screen.getByTestId("calculateDeliveryPrice"));
    const error = await screen.findByTestId("error");
    expect(error).toHaveTextContent("Cart value must be positive");
  });
});
