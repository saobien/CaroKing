import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import {
  getPlayerNames,
  savePlayerNames,
  getScores,
  resetScores,
} from "@/lib/storage";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [nameX, setNameX] = useState("Black");
  const [nameO, setNameO] = useState("White");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPlayerNames().then((n) => {
      setNameX(n.x);
      setNameO(n.o);
    });
  }, []);

  const handleSave = useCallback(async () => {
    const x = nameX.trim() || "Black";
    const o = nameO.trim() || "White";
    await savePlayerNames({ x, o });
    setNameX(x);
    setNameO(o);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [nameX, nameO]);

  const handleResetScores = useCallback(() => {
    Alert.alert("Reset Scores", "This will reset all player scores to zero.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          await resetScores();
        },
      },
    ]);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + webTopInset,
            paddingBottom: insets.bottom + webBottomInset,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>

          <Text style={styles.title}>Settings</Text>

          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Player Names</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <View
                  style={[
                    styles.inputPiece,
                    {
                      backgroundColor: Colors.pieceBlack,
                      borderColor: Colors.pieceBlackBorder,
                    },
                  ]}
                />
                <TextInput
                  style={styles.input}
                  value={nameX}
                  onChangeText={setNameX}
                  placeholder="Player 1 name"
                  placeholderTextColor="rgba(245,240,232,0.3)"
                  maxLength={16}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.inputRow}>
                <View
                  style={[
                    styles.inputPiece,
                    {
                      backgroundColor: Colors.pieceWhite,
                      borderColor: Colors.pieceWhiteBorder,
                    },
                  ]}
                />
                <TextInput
                  style={styles.input}
                  value={nameO}
                  onChangeText={setNameO}
                  placeholder="Player 2 name"
                  placeholderTextColor="rgba(245,240,232,0.3)"
                  maxLength={16}
                  returnKeyType="done"
                />
              </View>
            </View>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                saved && styles.savedButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              {saved ? (
                <Ionicons name="checkmark" size={20} color="#fff" />
              ) : (
                <Feather name="check" size={18} color="#fff" />
              )}
              <Text style={styles.saveText}>{saved ? "Saved" : "Save Names"}</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>

            <Pressable
              onPress={handleResetScores}
              style={({ pressed }) => [
                styles.dangerButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="refresh-outline" size={18} color={Colors.danger} />
              <Text style={styles.dangerText}>Reset Scores</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 28,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 4,
  },
  inputGroup: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  inputPiece: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
    padding: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.cardBorder,
    marginLeft: 48,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  savedButton: {
    backgroundColor: Colors.accentDark,
  },
  saveText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(232,93,93,0.2)",
  },
  dangerText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.danger,
  },
});
