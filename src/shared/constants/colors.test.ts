import * as colorsModule from "@/shared/constants/colors";
import {
  Colors_LoginPage,
  Colors_PurchasesPage,
} from "@/shared/constants/colors";

describe("Colors_PurchasesPage", () => {
  it("exposes the updated lowercase text color keys", () => {
    expect(Colors_PurchasesPage.textprimary).toBe("#1F1F1F");
    expect(Colors_PurchasesPage.textsecondary).toBe("#4A4A4A");
  });

  it("no longer exposes the old camelCase text color keys", () => {
    expect((Colors_PurchasesPage as Record<string, unknown>).textPrimary).toBeUndefined();
    expect((Colors_PurchasesPage as Record<string, unknown>).textSecondary).toBeUndefined();
  });

  it("uses the updated amber palette", () => {
    expect(Colors_PurchasesPage.background).toBe("#F59E0B");
    expect(Colors_PurchasesPage.topBtn).toBe("#D8CE8E");
    expect(Colors_PurchasesPage.enterBtn).toBe("#ECA834");
    expect(Colors_PurchasesPage.confirnBtn).toBe("#ECA834");
    expect(Colors_PurchasesPage.border).toBe("#F59E0B");
  });

  it("keeps enterBtn and confirnBtn in sync with each other", () => {
    expect(Colors_PurchasesPage.enterBtn).toBe(Colors_PurchasesPage.confirnBtn);
  });

  it("keeps background and border in sync with each other", () => {
    expect(Colors_PurchasesPage.background).toBe(Colors_PurchasesPage.border);
  });

  it("retains the untouched surface and font_size fields", () => {
    expect(Colors_PurchasesPage.surface).toBe("#FFF3A0");
    expect(Colors_PurchasesPage.surfaceAlt).toBe("#FFE45A");
    expect(Colors_PurchasesPage.inputBG).toBe("#FFFFFF");
    expect(Colors_PurchasesPage.topConfirmDetailsBtn).toBe("#FFEFA3");
    expect(Colors_PurchasesPage.font_size).toEqual({
      inputLabelSize: 24,
      inputPlaceHolder: 20,
      SubHeading: 26,
      details: 20,
      iconDetails: 15,
    });
  });
});

describe("Colors_BuyPage", () => {
  it("is no longer exported from the colors module", () => {
    expect("Colors_BuyPage" in colorsModule).toBe(false);
    expect((colorsModule as Record<string, unknown>).Colors_BuyPage).toBeUndefined();
  });
});

describe("Colors_LoginPage", () => {
  it("exposes all expected keys with the correct hex values", () => {
    expect(Colors_LoginPage).toEqual({
      signInBtn: "#212121",
      primaryBg: "#ffffff",
      primaryText: "#212121",
      secondaryText: "#424242",
      ternaryText: "#9e9e9e",
    });
  });

  it("uses a dark sign-in button color distinct from the background", () => {
    expect(Colors_LoginPage.signInBtn).not.toBe(Colors_LoginPage.primaryBg);
  });

  it("only defines string values for every color token", () => {
    Object.values(Colors_LoginPage).forEach((value) => {
      expect(typeof value).toBe("string");
    });
  });
});