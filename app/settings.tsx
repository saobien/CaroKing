import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { resetScores, clearHistory } from "@/lib/storage";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleResetScores = useCallback(() => {
    Alert.alert("Dat lai diem", "Tat ca diem so se tro ve 0.", [
      { text: "Huy", style: "cancel" },
      {
        text: "Dat lai",
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

  const handleClearHistory = useCallback(() => {
    Alert.alert("Xoa lich su", "Toan bo lich su se bi xoa.", [
      { text: "Huy", style: "cancel" },
      {
        text: "Xoa",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          await clearHistory();
        },
      },
    ]);
  }, []);

  return (
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
        <Text style={styles.title}>Cai Dat</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Luat Choi</Text>
          <View style={styles.rulesCard}>
            <View style={styles.ruleRow}>
              <View style={styles.ruleIcon}>
                <Ionicons name="grid-outline" size={18} color={Colors.accent} />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Ban co 13x13</Text>
                <Text style={styles.ruleDesc}>
                  Dat quan tren giao diem giong co Vay
                </Text>
              </View>
            </View>
            <View style={styles.ruleDivider} />
            <View style={styles.ruleRow}>
              <View style={styles.ruleIcon}>
                <Feather name="target" size={18} color={Colors.accent} />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>5 quan lien tiep</Text>
                <Text style={styles.ruleDesc}>
                  Xep 5 quan hang ngang, doc hoac cheo de thang
                </Text>
              </View>
            </View>
            <View style={styles.ruleDivider} />
            <View style={styles.ruleRow}>
              <View style={styles.ruleIcon}>
                <Ionicons
                  name="git-network-outline"
                  size={18}
                  color={Colors.accent}
                />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Bat quan</Text>
                <Text style={styles.ruleDesc}>
                  Bao vay quan doi phuong het khi (giong co Vay) de bat
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Du Lieu</Text>

          <Pressable
            onPress={handleResetScores}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.danger} />
            <Text style={styles.actionText}>Dat lai diem so</Text>
          </Pressable>

          <Pressable
            onPress={handleClearHistory}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            <Text style={styles.actionText}>Xoa lich su</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
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
  rulesCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
  },
  ruleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  ruleContent: {
    flex: 1,
    gap: 2,
  },
  ruleTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  ruleDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ruleDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.cardBorder,
    marginLeft: 58,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(232,93,93,0.15)",
  },
  actionText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.danger,
  },
});
