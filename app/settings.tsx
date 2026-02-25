import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { resetScores, clearHistory } from "@/lib/storage";
import { useBoardTheme } from "@/lib/theme-context";
import { BOARD_THEMES } from "@/constants/themes";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;
  const { theme, setThemeId } = useBoardTheme();

  const handleResetScores = useCallback(() => {
    Alert.alert("Đặt lại điểm", "Tất cả điểm số sẽ trở về 0.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đặt lại",
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
    Alert.alert("Xoá lịch sử", "Toàn bộ lịch sử sẽ bị xoá.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
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

  const handleEmailPress = useCallback(() => {
    Linking.openURL("mailto:saobien.me@gmail.com");
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
        <Text style={styles.title}>Cài Đặt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Luật Chơi</Text>
          <View style={styles.rulesCard}>
            <View style={styles.ruleRow}>
              <View style={styles.ruleIcon}>
                <Ionicons name="grid-outline" size={18} color={Colors.accent} />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Bàn cờ 13x13</Text>
                <Text style={styles.ruleDesc}>
                  Đặt quân trên giao điểm giống cờ Vây
                </Text>
              </View>
            </View>
            <View style={styles.ruleDivider} />
            <View style={styles.ruleRow}>
              <View style={styles.ruleIcon}>
                <Feather name="target" size={18} color={Colors.accent} />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>5 quân liên tiếp</Text>
                <Text style={styles.ruleDesc}>
                  Xếp 5 quân hàng ngang, dọc hoặc chéo để thắng
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
                <Text style={styles.ruleTitle}>Bắt quân</Text>
                <Text style={styles.ruleDesc}>
                  Bao vây quân đối phương hết khí (giống cờ Vây) để bắt
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giao Diện Bàn Cờ</Text>
          <View style={styles.themeGrid}>
            {BOARD_THEMES.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setThemeId(t.id);
                }}
                style={({ pressed }) => [
                  styles.themeOption,
                  theme.id === t.id && styles.themeOptionSelected,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View
                  style={[styles.themePreview, { backgroundColor: t.board }]}
                >
                  <View
                    style={[
                      styles.themePreviewLine,
                      { backgroundColor: t.boardLine },
                    ]}
                  />
                  <View
                    style={[
                      styles.themePreviewLineV,
                      { backgroundColor: t.boardLine },
                    ]}
                  />
                  <View
                    style={[
                      styles.themePreviewDot,
                      { backgroundColor: t.starPoint },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.themeLabel,
                    theme.id === t.id && styles.themeLabelSelected,
                  ]}
                >
                  {t.name}
                </Text>
                {theme.id === t.id && (
                  <View style={styles.themeCheck}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dữ Liệu</Text>

          <Pressable
            onPress={handleResetScores}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.danger} />
            <Text style={styles.actionText}>Đặt lại điểm số</Text>
          </Pressable>

          <Pressable
            onPress={handleClearHistory}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            <Text style={styles.actionText}>Xoá lịch sử</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tác Giả</Text>
          <View style={styles.authorCard}>
            <View style={styles.authorIconContainer}>
              <Ionicons name="person-circle-outline" size={40} color={Colors.accent} />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Sao Biển</Text>
              <Pressable onPress={handleEmailPress} style={styles.emailRow}>
                <Ionicons name="mail-outline" size={14} color={Colors.accent} />
                <Text style={styles.authorEmail}>saobien.me@gmail.com</Text>
              </Pressable>
            </View>
          </View>
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
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeOption: {
    alignItems: "center",
    gap: 6,
    position: "relative",
    width: "18%",
    minWidth: 60,
    flex: 1,
  },
  themeOptionSelected: {},
  themePreview: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  themePreviewLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
  },
  themePreviewLineV: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 1,
  },
  themePreviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -3,
    marginLeft: -3,
  },
  themeLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  themeLabelSelected: {
    color: Colors.accent,
    fontFamily: "Inter_600SemiBold",
  },
  themeCheck: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
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
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    gap: 14,
  },
  authorIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  authorInfo: {
    flex: 1,
    gap: 4,
  },
  authorName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorEmail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.accent,
  },
});
