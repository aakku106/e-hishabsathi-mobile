import { Colors_DashboardPage, getThemedColors } from "@/shared/constants/colors";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
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

import { useProfitSummary } from "@/features/dashboard/hooks/useDashboardData";
import { useProductSummary } from "@/features/inventory/hooks/useInventory";
import { usePurchaseSummary } from "@/features/purchase/hooks/usePurchaseEntries";
import { useSalesSummary } from "@/features/sales/hooks/useSalesEntries";
import { useUdharoSummary } from "@/features/udharo/hooks/useUdharoEntries";
import { useSettingsStore } from "@/store/settings.store";
import { useTheme } from "@/providers/ThemeProvider";
import { hapticError } from "@/shared/utils/haptics";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

// The AI assistant sheet covers almost the whole screen (including the header
// area). When the keyboard opens, the KeyboardAvoidingView inside keeps the
// input row above it.
// Slightly reduced from the full window height so the drag handle / header /
// input row stay comfortably reachable without the sheet feeling oversized.
const SHEET_HEIGHT = WINDOW_HEIGHT * 0.96;
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
  /** Question to re-run when the user taps Retry on an error bubble. */
  retryQuestion?: string;
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
  const [isAnswering, setIsAnswering] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const inputRef = useRef<TextInputInstance>(null);
  const onCloseRef = useRef(onClose);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const { data: profitSummary, refetch: refetchProfit } = useProfitSummary();
  const language = useSettingsStore((state) => state.language);

  // Keep the latest callback without restarting the animation whenever the
  // parent passes a new inline `onClose` function.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  // Show/hide animations
  useEffect(() => {
    if (visible) {
      isDismissing.value = false;
      translateY.value = withSpring(0, SPRING_CONFIG);
      backdropOpacity.value = withTiming(0.4, { duration: 200 });
      return;
    }

    isDismissing.value = true;
    translateY.value = withSpring(SHEET_HEIGHT, SPRING_CONFIG);
    backdropOpacity.value = withTiming(0, { duration: 200 });
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(
      () => runOnJS(onCloseRef.current)(),
      400,
    );
  }, [visible, backdropOpacity, isDismissing, translateY]);

  // Animated styles
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }), [translateY]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }), [backdropOpacity]);

  // Theme-aware sheet background
  const sheetBackgroundColor = isDark ? colors.background : "#FFFFFF";

  const startDismiss = () => {
    // eslint-disable-next-line react-hooks/immutability
    isDismissing.value = true;
    // eslint-disable-next-line react-hooks/immutability
    translateY.value = withSpring(SHEET_HEIGHT, SPRING_CONFIG);
    // eslint-disable-next-line react-hooks/immutability
    backdropOpacity.value = withTiming(0, { duration: 250 });
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => runOnJS(onCloseRef.current)(), 350);
  };

  // Gesture handler for swipe to dismiss
  const onGestureEvent = (event: { nativeEvent: { translationY: number } }) => {
    // Only allow dragging down (positive translation)
    const translation = Math.max(0, event.nativeEvent.translationY);
    // eslint-disable-next-line react-hooks/immutability
    translateY.value = translation;
  };

  const onHandlerStateChange = (event: { nativeEvent: { state: number; translationY: number; velocityY: number } }) => {
    if (event.nativeEvent.state === State.END) {
      const shouldDismiss = event.nativeEvent.translationY > DRAG_THRESHOLD || event.nativeEvent.velocityY > 1000;
      if (shouldDismiss) {
        startDismiss();
      } else {
        // eslint-disable-next-line react-hooks/immutability
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    }
  };

  const appendAnswerError = (questionText: string) => {
    hapticError();
    setMessages((current) => {
      const messageId = Date.now();
      return [
        ...current,
        { id: `${messageId}-question`, type: "user", text: questionText },
        {
          id: `${messageId}-error`,
          type: "bot",
          text: "I couldn't load your profit right now. Please try again.",
          retryQuestion: questionText,
        },
      ];
    });
    setQuestion((current) => (current.trim() === questionText ? "" : current));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  /**
   * Returns all-time profit, waiting for the query when it has no cached value
   * yet. A confirmed zero is still a number; `null` means loading failed.
   */
  const resolveProfit = async (): Promise<number | null> => {
    if (profitSummary) return profitSummary.profit;

    setIsAnswering(true);
    try {
      const result = await refetchProfit();
      return result.data?.profit ?? null;
    } catch {
      return null;
    } finally {
      setIsAnswering(false);
    }
  };

  const handleAsk = async (questionOverride?: string) => {
    const trimmedQuestion = (questionOverride ?? question).trim();
    if (!trimmedQuestion || isAnswering) return;

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

    if (asksForOverview || asksAboutProfit) {
      const profit = await resolveProfit();
      if (profit === null) {
        appendAnswerError(trimmedQuestion);
        return;
      }

      if (asksForOverview) {
        answer = `Overview: ${salesSummary?.entryCount ?? 0} sales worth Rs.${(salesSummary?.totalAmount ?? 0).toLocaleString("en-IN")}, ${purchaseSummary?.entryCount ?? 0} purchases worth Rs.${(purchaseSummary?.totalAmount ?? 0).toLocaleString("en-IN")}, ${udharoSummary?.entryCount ?? 0} Udhaaro records, and an all-time estimated profit of Rs.${profit.toLocaleString("en-IN")}.`;
      } else {
        answer = `Your all-time estimated profit is Rs.${profit.toLocaleString("en-IN")}. This is total sales minus the cost of goods sold.`;
      }
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
    setQuestion((current) => (current.trim() === trimmedQuestion ? "" : current));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleVoiceInput = () => {
    if (Platform.OS !== "web") {
      hapticError();
      Alert.alert("Voice input unavailable", "Voice input is currently enabled in the web version.");
      return;
    }

    const browserWindow = globalThis as typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      hapticError();
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
      hapticError();
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
        style={[
          styles.backdrop,
          backdropAnimatedStyle,
          { pointerEvents: visible ? "auto" : "none" },
        ]}
        onTouchStart={dismissKeyboard}
      />

      {/* Bottom Sheet */}
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
        <Animated.View style={[styles.sheetContainer, sheetAnimatedStyle]}>
          <View style={[styles.sheet, { backgroundColor: sheetBackgroundColor }]}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: isDark ? "#48484A" : "#C7C7CC" }]} />
            </View>

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={styles.title}>Khata Intelligence</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close AI Assistant"
                accessibilityHint="Close the AI assistant"
                hitSlop={12}
                onPress={startDismiss}
                style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
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
                  {m.retryQuestion ? (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Retry loading the answer"
                      onPress={() => {
                        void handleAsk(m.retryQuestion);
                      }}
                      style={[styles.retryBtn, { borderColor: colors.primary }]}>
                      <Text style={[styles.retryText, { color: colors.primary }]}>
                        Retry
                      </Text>
                    </TouchableOpacity>
                  ) : null}
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
                  onSubmitEditing={() => {
                    void handleAsk();
                  }}
                  returnKeyType="send"
                  editable={!isAnswering}
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
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    { backgroundColor: isAnswering ? colors.textMuted : colors.primary },
                  ]}
                  onPress={() => {
                    void handleAsk();
                  }}
                  disabled={isAnswering}
                  accessibilityState={{ disabled: isAnswering, busy: isAnswering }}>
                  {isAnswering ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MaterialCommunityIcons name="arrow-up" size={18} color="#fff" />
                  )}
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
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },

  // Close button (top-right of sheet header)
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
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
  retryBtn: {
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
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