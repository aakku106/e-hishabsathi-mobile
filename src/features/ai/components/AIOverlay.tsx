import { Colors_DashboardPage, getThemedColors } from "@/shared/constants/colors";
import { Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { useProductSummary } from "@/features/inventory/hooks/useInventory";
import { usePurchaseSummary } from "@/features/purchase/hooks/usePurchaseEntries";
import { useSalesSummary } from "@/features/sales/hooks/useSalesEntries";
import { useUdharoSummary } from "@/features/udharo/hooks/useUdharoEntries";
import { useSettingsStore } from "@/store/settings.store";
import { useTheme } from "@/providers/ThemeProvider";

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get("window");

const SHEET_HEIGHT = WINDOW_HEIGHT * 0.85;
const DRAG_THRESHOLD = 100;
const SPRING_CONFIG = { damping: 25, stiffness: 200, mass: 1 };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  start: () => void;
  stop: () => void;
};

type AssistantMessage = {
  id: string;
  type: "bot" | "user";
  text: string;
};

export default function AIOverlay({
  visible = true,
  onClose = () => {},
  initialQuestion = "",
}: {
  visible?: boolean;
  onClose?: () => void;
  initialQuestion?: string;
}) {
  const { isDark } = useTheme();
  const colors = getThemedColors(Colors_DashboardPage, isDark);

  // Reanimated shared values for spring animations
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const isDismissing = useSharedValue(false);

  // Local state
  const [question, setQuestion] = useState(initialQuestion);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Ask me about your sales, purchases, profit, or customers.",
    },
  ]);
  const { data: salesSummary } = useSalesSummary();
  const { data: purchaseSummary } = usePurchaseSummary();
  const { data: udharoSummary } = useUdharoSummary();
  const { data: productSummary } = useProductSummary();
  const language = useSettingsStore((state) => state.language);

  // Show/hide animations
  useEffect(() => {
    if (visible) {
      isDismissing.value = false;
      translateY.value = withSpring(0, SPRING_CONFIG);
      backdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      isDismissing.value = true;
      translateY.value = withSpring(SHEET_HEIGHT, SPRING_CONFIG);
      backdropOpacity.value = withTiming(0, { duration: 200 });
      // Call onClose after animation
      setTimeout(() => runOnJS(onClose)(), 400);
    }
  }, [visible, onClose]);

  // Animated styles
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }), [translateY]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }), [backdropOpacity]);

  // Theme-aware sheet background
  const sheetBackgroundColor = isDark ? colors.background : "#FFFFFF";

  // Gesture handler for swipe to dismiss
  const onGestureEvent = (event: { nativeEvent: { translationY: number } }) => {
    // Only allow dragging down (positive translation)
    const translation = Math.max(0, event.nativeEvent.translationY);
    translateY.value = translation;
  };

  const onHandlerStateChange = (event: { nativeEvent: { state: number; translationY: number; velocityY: number } }) => {
    if (event.nativeEvent.state === State.END) {
      const shouldDismiss = event.nativeEvent.translationY > DRAG_THRESHOLD || event.nativeEvent.velocityY > 1000;
      if (shouldDismiss) {
        isDismissing.value = true;
        translateY.value = withSpring(SHEET_HEIGHT, SPRING_CONFIG);
        backdropOpacity.value = withTiming(0, { duration: 250 });
        setTimeout(() => runOnJS(onClose)(), 350);
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    }
  };

  const handleAsk = () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    const normalizedQuestion = trimmedQuestion.toLowerCase();
    const asksAboutSales =
      /sale|sell|sold|revenue|income|बिक्री|बेचे|आम्दानी/.test(normalizedQuestion);
    const asksAboutPurchases =
      /buy|buys|purchase|purchases|spend|bought|खरिद|किन|खर्च/.test(normalizedQuestion);
    const asksAboutUdharo =
      /udharo|udhar|credit|owe|owed|debt|overdue|customer|उधारो|उधार|ऋण|ग्राहक/.test(normalizedQuestion);
    const asksAboutInventory =
      /inventory|stock|product|products|item|items|इन्भेन्टरी|स्टक|उत्पादन|वस्तु/.test(normalizedQuestion);
    const asksAboutProfit = /profit|earning|earnings|margin|नाफा|कमाइ/.test(normalizedQuestion);
    const asksForOverview =
      /dashboard|summary|everything|all my|overall|ड्यासबोर्ड|सारांश|सबै/.test(normalizedQuestion);
    let answer =
      "I can answer questions about your sales, purchases, Udhaaro, inventory, profit, and dashboard totals.";

    if (asksForOverview) {
      const profit = (salesSummary?.totalAmount ?? 0) - (purchaseSummary?.totalAmount ?? 0);
      answer = `Overview: ${salesSummary?.entryCount ?? 0} sales worth Rs.${(salesSummary?.totalAmount ?? 0).toLocaleString("en-IN")}, ${purchaseSummary?.entryCount ?? 0} purchases worth Rs.${(purchaseSummary?.totalAmount ?? 0).toLocaleString("en-IN")}, ${udharoSummary?.entryCount ?? 0} Udhaaro records, and estimated profit of Rs.${profit.toLocaleString("en-IN")}.`;
    } else if (asksAboutProfit) {
      const profit = (salesSummary?.totalAmount ?? 0) - (purchaseSummary?.totalAmount ?? 0);
      answer = `Your estimated profit is Rs.${profit.toLocaleString("en-IN")}. This is sales total minus purchase total.`;
    } else if (asksAboutSales && (salesSummary?.entryCount ?? 0) === 0) {
      answer = language === "np" ? "तपाईंले अहिलेसम्म केही बिक्री गर्नुभएको छैन।" : "You haven't sold anything yet.";
    } else if (asksAboutSales) {
      answer = `You have ${salesSummary?.entryCount ?? 0} sale${salesSummary?.entryCount === 1 ? "" : "s"}, totaling Rs.${(salesSummary?.totalAmount ?? 0).toLocaleString("en-IN")}.`;
    } else if (asksAboutPurchases && (purchaseSummary?.entryCount ?? 0) === 0) {
      answer = "You haven't recorded any purchases yet.";
    } else if (asksAboutPurchases) {
      answer = `You have ${purchaseSummary?.entryCount ?? 0} purchase${purchaseSummary?.entryCount === 1 ? "" : "s"}, totaling Rs.${(purchaseSummary?.totalAmount ?? 0).toLocaleString("en-IN")}, with ${purchaseSummary?.totalQuantity ?? 0} units.`;
    } else if (asksAboutUdharo && (udharoSummary?.entryCount ?? 0) === 0) {
      answer = "You don't have any Udhaaro records yet.";
    } else if (asksAboutUdharo) {
      answer = `You have ${udharoSummary?.entryCount ?? 0} Udhaaro record${udharoSummary?.entryCount === 1 ? "" : "s"} totaling Rs.${(udharoSummary?.totalAmount ?? 0).toLocaleString("en-IN")}. ${udharoSummary?.overdueCount ?? 0} ${udharoSummary?.overdueCount === 1 ? "is" : "are"} overdue.`;
    } else if (asksAboutInventory && (productSummary?.productCount ?? 0) === 0) {
      answer = "You don't have any inventory products yet.";
    } else if (asksAboutInventory) {
      answer = `You have ${productSummary?.productCount ?? 0} product${productSummary?.productCount === 1 ? "" : "s"} with ${productSummary?.totalUnits ?? 0} units in stock. ${productSummary?.lowStockCount ?? 0} ${productSummary?.lowStockCount === 1 ? "product is" : "products are"} low on stock.`;
    }

    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-question`, type: "user", text: trimmedQuestion },
      { id: `${Date.now()}-answer`, type: "bot", text: answer },
    ]);
    setQuestion("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleVoiceInput = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Voice input unavailable", "Voice input is currently enabled in the web version.");
      return;
    }

    const browserWindow = globalThis as typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      Alert.alert("Voice input unavailable", "Try Chrome or Edge for microphone voice input.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = language === "np" ? "ne-NP" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      Alert.alert("Voice input failed", "Please allow microphone access and try again.");
    };
    recognition.onresult = (event) => {
      setQuestion(event.results[0]?.[0]?.transcript ?? "");
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const dismissKeyboard = () => {
    inputRef.current?.blur();
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        onTouchStart={dismissKeyboard}
        pointerEvents={visible ? "auto" : "none"}
      />

      {/* Bottom Sheet */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.sheetContainer, sheetAnimatedStyle]}>
          <View style={[styles.sheet, { backgroundColor: sheetBackgroundColor }]}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: isDark ? "#48484A" : "#C7C7CC" }]} />
            </View>

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={styles.title}>Khata Intelligence</Text>
            </View>

            {/* Messages */}
            <ScrollView
              style={styles.messages}
              contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubble,
                    {
                      backgroundColor: m.type.startsWith("bot") ? colors.primarySoft : colors.primary,
                      alignSelf: m.type.startsWith("bot") ? "flex-start" : "flex-end",
                      borderColor: m.type.startsWith("bot") ? colors.border : colors.primary,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.messageText,
                      { color: m.type.startsWith("bot") ? colors.textPrimary : "#FFFFFF" },
                    ]}>
                    {m.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}>
              <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TextInput
                  ref={inputRef}
                  placeholder="What would you like to know?"
                  style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                  placeholderTextColor={colors.textMuted}
                  value={question}
                  onChangeText={setQuestion}
                  onSubmitEditing={handleAsk}
                  returnKeyType="send"
                  editable
                  blurOnSubmit={false}
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.micBtn, { backgroundColor: isListening ? colors.danger + "20" : colors.primarySoft }]}
                  onPress={handleVoiceInput}>
                  <MaterialCommunityIcons
                    name={isListening ? "stop" : "microphone"}
                    size={20}
                    color={isListening ? colors.danger : colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={handleAsk}>
                  <MaterialCommunityIcons name="arrow-up" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
}

const styles = StyleSheet.create({
  // Full-screen backdrop
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 998,
  },

  // Sheet container fills screen, sheet is positioned at bottom
  sheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 999,
    justifyContent: "flex-end",
  },

  // The actual sheet (backgroundColor applied dynamically)
  sheet: {
    width: "100%",
    maxHeight: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },

  // Drag handle at top
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },

  // Header
  header: {
    height: 56,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  // Messages area
  messages: {
    flex: 1,
  },
  messageBubble: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: "85%",
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },

  // Input row
  inputRow: {
    height: 72,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
});