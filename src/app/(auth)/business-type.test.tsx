import { render, screen } from "@testing-library/react-native";
import React from "react";

import BusinessTypeRoute from "@/app/(auth)/business-type";

describe("BusinessTypeRoute", () => {
  it("renders without crashing", () => {
    expect(() => render(<BusinessTypeRoute />)).not.toThrow();
  });

  it("no longer renders the 'Business Type' text since it is commented out", () => {
    render(<BusinessTypeRoute />);

    expect(screen.queryByText("Business Type")).toBeNull();
  });

  it("renders a single centered container with no visible children", () => {
    const tree = render(<BusinessTypeRoute />).toJSON();

    expect(tree.type).toBe("View");
    expect(tree.children).toBeNull();
    expect(tree.props.style).toEqual({
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    });
  });
});