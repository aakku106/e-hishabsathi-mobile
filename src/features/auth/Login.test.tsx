import { render, screen } from "@testing-library/react-native";
import React from "react";

import LoginScreen from "@/features/auth/Login";

describe("LoginScreen", () => {
  it("renders the welcome header and subtitle", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Welcome Back!!")).toBeTruthy();
    expect(screen.getByText("Please Login your Account")).toBeTruthy();
  });

  it("renders all three labeled inputs with their placeholders", () => {
    render(<LoginScreen />);

    expect(screen.getByText("PAN")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter Your PAN number")).toBeTruthy();

    expect(screen.getByText("User Name")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter Your User Name")).toBeTruthy();

    expect(screen.getByText("Password")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter Your Password")).toBeTruthy();
  });

  it("marks the password field as a secure text entry", () => {
    render(<LoginScreen />);

    const passwordInput = screen.getByPlaceholderText("Enter Your Password");
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it("does not mark the PAN or User Name fields as secure text entry", () => {
    render(<LoginScreen />);

    expect(
      screen.getByPlaceholderText("Enter Your PAN number").props
        .secureTextEntry,
    ).toBeFalsy();
    expect(
      screen.getByPlaceholderText("Enter Your User Name").props
        .secureTextEntry,
    ).toBeFalsy();
  });

  it("renders the Forgot Password action", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Forgot Password")).toBeTruthy();
  });

  it("renders the Sign in button", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Sign in")).toBeTruthy();
  });

  it("renders the OR divider between sign in and registration", () => {
    render(<LoginScreen />);

    expect(screen.getByText("OR")).toBeTruthy();
  });

  it("renders the registration call to action", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Didn\u2019t have an Account!? ")).toBeTruthy();
    expect(screen.getByText("Register With Us")).toBeTruthy();
  });

  it("matches the previously rendered UI snapshot", () => {
    const tree = render(<LoginScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});