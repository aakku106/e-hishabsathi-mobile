import { useSettingsStore } from "@/store/settings.store";

const translations: Record<string, string> = {
  "Sales|बिक्री": "Sales",
  "Buy|किन्नुहोस्": "Buy",
  "Udharo|उधारो": "Udharo",
  "Dashboard|ड्यासबोर्ड": "Dashboard",
  "Setting|सेटिङ": "Setting",
  "Add a new sale|नयाँ बिक्री थप्नुहोस्": "Add a new sale",
  "Add a new purchase|नयाँ खरिद थप्नुहोस्": "Add a new purchase",
  "Track money owed to you|तपाईंलाई तिर्न बाँकी रकम ट्र्याक गर्नुहोस्": "Track money owed to you",
  "Track what you buy for your shop|पसलका खरिदहरू ट्र्याक गर्नुहोस्": "Track what you buy for your shop",
  "Products|उत्पादनहरू": "Products",
  "Product|उत्पादन": "Product",
  "Quantity|परिमाण": "Quantity",
  "Price|मूल्य": "Price",
  "Name|नाम": "Name",
  "Amount|रकम": "Amount",
  "Supplier|आपूर्तिकर्ता": "Supplier",
  "Phone Number|फोन नम्बर": "Phone Number",
  "Due Date|भुक्तानी मिति": "Due Date",
  "More|थप": "More",
  "Add Product|उत्पादन थप्नुहोस्": "Add Product",
  "Save Buy|खरिद सुरक्षित गर्नुहोस्": "Save Buy",
  "Save entry|प्रविष्टि सुरक्षित गर्नुहोस्": "Save entry",
  "Reset|रिसेट": "Reset",
  "Total Amount|कुल रकम": "Total Amount",
  "Recent Buys|हालका खरिदहरू": "Recent Buys",
  "Recent udharo|हालका उधारोहरू": "Recent udharo",
  "Today|आज": "Today",
  "This Week|यो हप्ता": "This Week",
  "This Month|यो महिना": "This Month",
  "This Year|यो वर्ष": "This Year",
  "Income vs Spend|आम्दानी र खर्च": "Income vs Spend",
  "Business Trend|व्यवसाय प्रवृत्ति": "Business Trend",
  "Income|आम्दानी": "Income",
  "Spend|खर्च": "Spend",
  "Month|महिना": "Month",
  "Year|वर्ष": "Year",
  "Total Sales|कुल बिक्री": "Total Sales",
  "Total Buys|कुल खरिद": "Total Buys",
  "Total Ud h aro|कुल उधारो": "Total Ud h aro",
  "Total Profit|कुल नाफा": "Total Profit",
  "Entries|प्रविष्टिहरू": "Entries",
  "Total|कुल": "Total",
  "Recent sales|हालका बिक्रीहरू": "Recent sales",
  "Item|वस्तु": "Item",
  "Listening|सुन्दै": "Listening",
  "AI Voice|AI आवाज": "AI Voice",
  "Speak now|अहिले बोल्नुहोस्": "Speak now",
  "Fill with voice|आवाजद्वारा भर्नुहोस्": "Fill with voice",
  "Enter Quantity|परिमाण लेख्नुहोस्": "Enter Quantity",
  "Enter Product name|उत्पादनको नाम लेख्नुहोस्": "Enter Product name",
  "Enter Price|मूल्य लेख्नुहोस्": "Enter Price",
  "Enter Supplier name|आपूर्तिकर्ताको नाम लेख्नुहोस्": "Enter Supplier name",
  "Enter Name|नाम लेख्नुहोस्": "Enter Name",
  "Enter phone number|फोन नम्बर लेख्नुहोस्": "Enter phone number",
  "Select extra detail|थप विवरण छान्नुहोस्": "Select extra detail",
  "People|मानिस": "People",
  "Overdue|म्याद नाघेको": "Overdue",
  "No purchases yet. Add your first entry above.|अहिलेसम्म खरिद छैन। माथि पहिलो प्रविष्टि थप्नुहोस्।": "No purchases yet. Add your first entry above.",
  "No udharo entries yet. Add your first one above.|अहिलेसम्म उधारो प्रविष्टि छैन। माथि पहिलो थप्नुहोस्।": "No udharo entries yet. Add your first one above.",
  "Currently|हाल": "Currently",
  "on|चालु": "on",
  "off|बन्द": "off",
};

export function translate(text: string, language: "en" | "np"): string {
  if (language === "en") return text;
  const match = Object.entries(translations).find(([key]) => key.startsWith(`${text}|`));
  return match?.[0].split("|")[1] ?? text;
}

export function useCopy() {
  const language = useSettingsStore((state) => state.language);
  return { language, t: (text: string) => translate(text, language) };
}
