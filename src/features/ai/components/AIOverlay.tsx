import { Colors_DashboardPage } from "@/shared/constants/colors";
import { Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
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

import { useSalesSummary } from "@/features/sales/hooks/useSalesEntries";
import { usePurchaseSummary } from "@/features/purchase/hooks/usePurchaseEntries";
import { useUdharoSummary } from "@/features/udharo/hooks/useUdharoEntries";
import { useProductSummary } from "@/features/inventory/hooks/useInventory";
import { useSettingsStore } from "@/store/settings.store";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

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

export default function AIOverlay({
  visible = true,
  onClose = () => {},
  initialQuestion = "",
}: {
  visible?: boolean;
  onClose?: () => void;
  initialQuestion?: string;
}) {
  const sheetHeight = WINDOW_HEIGHT * 0.85;
  const [translateY] = useState(() => new Animated.Value(sheetHeight));
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

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 240,
        useNativeDriver: true,
      }).start(() => onClose());
    }
  }, [visible, onClose, sheetHeight, translateY]);

  const handleAsk = () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    const normalizedQuestion = trimmedQuestion.toLowerCase();
    const asksAboutSales =
      /sale|sell|sold|revenue|income|बिक्री|बेचे|आम्दानी/.test(
        normalizedQuestion,
      );
    const asksAboutPurchases =
      /buy|buys|purchase|purchases|spend|bought|खरिद|किन|खर्च/.test(
        normalizedQuestion,
      );
    const asksAboutUdharo =
      /udharo|udhar|credit|owe|owed|debt|overdue|customer|उधारो|उधार|ऋण|ग्राहक/.test(
        normalizedQuestion,
      );
    const asksAboutInventory =
      /inventory|stock|product|products|item|items|इन्भेन्टरी|स्टक|उत्पादन|वस्तु/.test(
        normalizedQuestion,
      );
    const asksAboutProfit = /profit|earning|earnings|margin|नाफा|कमाइ/.test(
      normalizedQuestion,
    );
    const asksForOverview =
      /dashboard|summary|everything|all my|overall|ड्यासबोर्ड|सारांश|सबै/.test(
        normalizedQuestion,
      );
    let answer =
      "I can answer questions about your sales, purchases, Udhaaro, inventory, profit, and dashboard totals.";

    if (asksForOverview) {
      const profit =
        (salesSummary?.totalAmount ?? 0) - (purchaseSummary?.totalAmount ?? 0);
      answer = `Overview: ${salesSummary?.entryCount ?? 0} sales worth Rs.${(salesSummary?.totalAmount ?? 0).toLocaleString("en-IN")}, ${purchaseSummary?.entryCount ?? 0} purchases worth Rs.${(purchaseSummary?.totalAmount ?? 0).toLocaleString("en-IN")}, ${udharoSummary?.entryCount ?? 0} Udhaaro records, and estimated profit of Rs.${profit.toLocaleString("en-IN")}.`;
    } else if (asksAboutProfit) {
      const profit =
        (salesSummary?.totalAmount ?? 0) - (purchaseSummary?.totalAmount ?? 0);
      answer = `Your estimated profit is Rs.${profit.toLocaleString("en-IN")}. This is sales total minus purchase total.`;
    } else if (asksAboutSales && (salesSummary?.entryCount ?? 0) === 0) {
      answer =
        language === "np" ?
          "तपाईंले अहिलेसम्म केही बिक्री गर्नुभएको छैन।"
        : "You haven't sold anything yet.";
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
    } else if (
      asksAboutInventory &&
      (productSummary?.productCount ?? 0) === 0
    ) {
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
      Alert.alert(
        "Voice input unavailable",
        "Voice input is currently enabled in the web version.",
      );
      return;
    }

    const browserWindow = globalThis as typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      Alert.alert(
        "Voice input unavailable",
        "Try Chrome or Edge for microphone voice input.",
      );
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
      Alert.alert(
        "Voice input failed",
        "Please allow microphone access and try again.",
      );
    };
    recognition.onresult = (event) => {
      setQuestion(event.results[0]?.[0]?.transcript ?? "");
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            Animated.timing(translateY, {
              toValue: sheetHeight,
              duration: 220,
              useNativeDriver: true,
            }).start(() => onClose());
          }}>
          <MaterialCommunityIcons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Khata inteligance</Text>
      </View>

      <ScrollView
        style={styles.messages}
        contentContainerStyle={{ padding: Spacing.md }}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.messageBubble,
              m.type.startsWith("bot") ? styles.botBubble : styles.userBubble,
            ]}>
            <Text
              style={[
                styles.messageText,
                m.type.startsWith("bot") ? styles.botText : styles.userText,
              ]}>
              {m.text}
            </Text>
          </View>
        ))}

        <View style={styles.helperCard}>
          <Text style={styles.helperText}>
            If you want to contac them heres their contract number:\n1. Ram
            Parshad Khatawada: 9xxxxxxxxx\n2. Rishi Ram : 985xxxxxxx
          </Text>
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            placeholder="What would you like to know?"
            style={styles.input}
            placeholderTextColor="#9CA3AF"
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={handleAsk}
            returnKeyType="send"
            editable
            blurOnSubmit={false}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micBtnActive]}
            onPress={handleVoiceInput}>
            <MaterialCommunityIcons
              name={isListening ? "stop" : "microphone"}
              size={20}
              color="#111"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} onPress={handleAsk}>
            <MaterialCommunityIcons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

type AssistantMessage = {
  id: string;
  type: "bot" | "user";
  text: string;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: WINDOW_HEIGHT * 0.85,
    backgroundColor: "#0F0F0F",
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 999,
  },
  header: {
    height: 56,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    left: Spacing.md,
    top: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  title: {
    color: "#FFF",
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  messages: {
    flex: 1,
  },
  messageBubble: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 8,
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  botBubble: {
    backgroundColor: "#EBD98A",
  },
  botText: {
    color: "#111",
  },
  userBubble: {
    backgroundColor: "#CFF2D8",
    alignSelf: "flex-end",
  },
  userText: {
    color: "#0B3A1F",
  },
  helperCard: {
    backgroundColor: "#EBD98A",
    padding: Spacing.md,
    borderRadius: 10,
    marginTop: Spacing.md,
  },
  helperText: {
    color: "#111",
  },
  inputRow: {
    height: 72,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
  micBtnActive: {
    backgroundColor: "#CFF2D8",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors_DashboardPage.greenPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
});
