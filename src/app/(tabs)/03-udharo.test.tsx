import { render, screen } from "@testing-library/react-native";
import React from "react";

import UdharoRoute from "@/app/(tabs)/03-udharo";
import UdharoScreen from "@/features/udharo/UdharoScreen";

describe("Udharo route", () => {
  it("re-exports the udharo feature's UdharoScreen component as the default export", () => {
    expect(UdharoRoute).toBe(UdharoScreen);
  });

  it("renders the Udharo feature screen content when mounted through the route", () => {
    render(<UdharoRoute />);

    expect(screen.getByText("Recent entries")).toBeTruthy();
  });
});