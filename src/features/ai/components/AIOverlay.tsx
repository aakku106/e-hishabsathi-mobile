import { Colors_DashboardPage } from "@/shared/constants/colors";
import { Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

export default function AIOverlay({
  visible = true,
  onClose = () => {},
}: {
  visible?: boolean;
  onClose?: () => void;
}) {
  const sheetHeight = WINDOW_HEIGHT * 0.85;
  const translateY = useRef(new Animated.Value(sheetHeight)).current;

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
  }, [visible]);

  // sample messages (static for now)
  const messages = [
    { id: "1", type: "bot", text: "List Todays main selling products" },
    {
      id: "2",
      type: "bot-response",
      text: "Sure. Here is a Detailed list of Top selling products of today sold :\n1. Black Pants  -> 20 pics\n2. Red shocks  -> 13 pics\n3. Gray Hat  -> 3 pics\n4. Pink Skirt  -> 1 pics\n\nProfit :\n1. Profit from Pants  -> 10k\n2. Profit from Hat  -> 8k\n3. Profit from shcoks  -> 1.2k\n4. Profit from Skirt  -> Rs.350\n\nWould you like me to pridict what product will make most profit tummrow ?",
    },
    { id: "3", type: "user", text: "Aaja Kos kos Ley udharo ligako theyyo ?" },
  ];

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

      <View style={styles.inputRow}>
        <TextInput
          placeholder="What would you like to know?"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.micBtn}>
          <MaterialCommunityIcons name="microphone" size={20} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendBtn}>
          <MaterialCommunityIcons name="arrow-up" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

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
