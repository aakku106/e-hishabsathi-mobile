import { render, screen } from "@testing-library/react-native";
import React from "react";

import SalesRoute from "@/app/(tabs)/01-sales";
import { Colors_SalesPage } from "@/shared/constants/colors";

describe("SalesRoute", () => {
  it("renders without crashing", () => {
    expect(() => render(<SalesRoute />)).not.toThrow();
  });

  it("no longer renders the TopButton or 'Sales' text since they are commented out", () => {
    render(<SalesRoute />);

    expect(screen.queryByText("Sales")).toBeNull();
    expect(screen.queryByText("I want Food")).toBeNull();
  });

  it("renders a single styled container with no visible children", () => {
    const tree = render(<SalesRoute />).toJSON();

    expect(tree.type).toBe("View");
    expect(tree.children).toBeNull();
    expect(tree.props.style).toEqual({
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors_SalesPage.background,
    });
  });
});