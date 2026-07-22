import { render, screen } from "@testing-library/react-native";
import React from "react";

import OnboardingRoute from "@/app/(auth)/onboarding";

describe("OnboardingRoute", () => {
  it("renders without crashing", () => {
    expect(() => render(<OnboardingRoute />)).not.toThrow();
  });

  it("no longer renders the 'Onboarding' text since it is commented out", () => {
    render(<OnboardingRoute />);

    expect(screen.queryByText("Onboarding")).toBeNull();
  });

  it("renders a single centered container with no visible children", () => {
    const tree = render(<OnboardingRoute />).toJSON();

    expect(tree.type).toBe("View");
    expect(tree.children).toBeNull();
    expect(tree.props.style).toEqual({
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    });
  });
});