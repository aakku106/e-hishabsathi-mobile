import { render, screen } from "@testing-library/react-native";
import React from "react";

import LoginRoute from "@/app/(auth)/login";
import LoginScreen from "@/features/auth/Login";

describe("Login route", () => {
  it("re-exports the auth feature's LoginScreen component as the default export", () => {
    expect(LoginRoute).toBe(LoginScreen);
  });

  it("renders the Login feature screen content when mounted through the route", () => {
    render(<LoginRoute />);

    expect(screen.getByText("Welcome Back!!")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });
});