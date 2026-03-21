import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SOSButton from "@/components/SOSButton";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const BASE_URL = "https://winfred-bearable-winterishly.ngrok-free.dev";

const FEATURES = [
  {
    icon: "map-outline",
    title: "Safe Route",
    desc: "AI-powered risk scoring for safest path",
    color: "#4ade80",
    badge: "AI",
  },
  {
    icon: "flame-outline",
    title: "Heatmap",
    desc: "Real-time unsafe area visualization",
    color: "#f97316",
    badge: "LIVE",
  },
  {
    icon: "chatbubble-ellipses-outline",
    title: "Safety Assistant",
    desc: "AI guide for stressful situations",
    color: "#a78bfa",
    badge: "AI",
  },
  {
    icon: "warning-outline",
    title: "Report Incident",
    desc: "Community safety reporting",
    color: "#fb923c",
    badge: null,
  },
  {
    icon: "moon-outline",
    title: "Night Mode",
    desc: "Auto-protection after dark",
    color: "#60a5fa",
    badge: "AUTO",
  },
  {
    icon: "location-outline",
    title: "Live Location",
    desc: "Share location with contacts",
    color: "#34d399",
    badge: null,
  },
];

const TIPS = [
  "Stay in well-lit areas at night",
  "Share your live location with trusted contacts",
  "Trust your instincts — if something feels off, leave",
  "Keep emergency contacts updated",
];

function NightProtectionOverlay({ onDisable }: { onDisable: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shieldAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Shield entrance
    Animated.spring(shieldAnim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    ).start();

    // Glow breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    const timer = setInterval(() => setElapsed((e) => e + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  const timeLabel = elapsed === 0 ? "Just activated" : `${elapsed}m active`;

  const ACTIVE_PROTECTIONS = [
    { icon: "location", label: "Live Location", sub: "Shared with 2 contacts", color: "#34d399" },
    { icon: "notifications", label: "Heightened Alerts", sub: "All movement monitored", color: "#fad047" },
    { icon: "wifi", label: "Emergency Broadcast", sub: "Ready to transmit", color: "#f87171" },
    { icon: "shield-checkmark", label: "Safe Walk Timer", sub: "Auto-check every 15m", color: "#a78bfa" },
  ];

  return (
    <Modal animationType="fade" transparent statusBarTranslucent>
      <View style={ns.overlay}>
        {/* Dark blue starfield bg */}
        <View style={ns.bgLayer} />

        <ScrollView contentContainerStyle={ns.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <View style={ns.topBar}>
            <View style={ns.livePill}>
              <View style={ns.liveDot} />
              <Text style={ns.liveText}>PROTECTED</Text>
            </View>
            <Text style={ns.elapsedText}>{timeLabel}</Text>
          </View>

          {/* Shield icon with pulse */}
          <View style={ns.shieldWrapper}>
            <Animated.View style={[ns.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
            <Animated.View style={[ns.glowRing, { opacity: glowOpacity }]} />
            <Animated.View
              style={[
                ns.shieldCircle,
                {
                  transform: [
                    { scale: shieldAnim },
                    {
                      rotate: shieldAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["-15deg", "0deg"],
                      }),
                    },
                  ],
                  opacity: shieldAnim,
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={52} color="#60a5fa" />
            </Animated.View>
          </View>

          <Text style={ns.headingText}>Night Protection{"\n"}Active</Text>
          <Text style={ns.subText}>You are being watched over. Stay aware and trust your instincts.</Text>

          {/* Active protections */}
          <View style={ns.protectionsCard}>
            <Text style={ns.cardLabel}>ACTIVE PROTECTIONS</Text>
            {ACTIVE_PROTECTIONS.map((p, i) => (
              <View key={i}>
                <View style={ns.protectionRow}>
                  <View style={[ns.protectionIcon, { backgroundColor: p.color + "22" }]}>
                    <Ionicons name={p.icon as any} size={18} color={p.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={ns.protectionLabel}>{p.label}</Text>
                    <Text style={ns.protectionSub}>{p.sub}</Text>
                  </View>
                  <View style={[ns.checkDot, { backgroundColor: p.color }]} />
                </View>
                {i < ACTIVE_PROTECTIONS.length - 1 && <View style={ns.protectionDivider} />}
              </View>
            ))}
          </View>

          {/* Quick stats */}
          <View style={ns.statsRow}>
            {[
              { val: "2", label: "Contacts\nAlerted" },
              { val: "42", label: "Area Risk\nScore" },
              { val: "15m", label: "Check-in\nTimer" },
            ].map((s, i) => (
              <View key={i} style={ns.statBox}>
                <Text style={ns.statVal}>{s.val}</Text>
                <Text style={ns.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Disable button */}
          <TouchableOpacity style={ns.disableBtn} onPress={onDisable} activeOpacity={0.8}>
            <Ionicons name="moon-outline" size={18} color="#60a5fa" />
            <Text style={ns.disableBtnText}>Disable Night Protection</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const ns = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#020818" },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020818",
    opacity: 0.98,
  },
  scrollContent: { paddingHorizontal: 24, paddingTop: 64, alignItems: "center" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34d399" + "22",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#34d399" + "55",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34d399",
    marginRight: 6,
  },
  liveText: { color: "#34d399", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  elapsedText: { color: "#60a5fa" + "88", fontSize: 12, fontWeight: "500" },
  shieldWrapper: { justifyContent: "center", alignItems: "center", width: 160, height: 160, marginBottom: 24 },
  pulseRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: "#60a5fa" + "44",
  },
  glowRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#60a5fa" + "18",
  },
  shieldCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#60a5fa" + "18",
    borderWidth: 1.5,
    borderColor: "#60a5fa" + "66",
    justifyContent: "center",
    alignItems: "center",
  },
  headingText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 10,
  },
  subText: {
    color: "#60a5fa" + "99",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  protectionsCard: {
    backgroundColor: "#0d1b36",
    borderRadius: 20,
    padding: 18,
    width: "100%",
    borderWidth: 1,
    borderColor: "#60a5fa" + "22",
    marginBottom: 16,
  },
  cardLabel: {
    color: "#60a5fa" + "77",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 14,
  },
  protectionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 2 },
  protectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  protectionLabel: { color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  protectionSub: { color: "#475569", fontSize: 11, marginTop: 1 },
  checkDot: { width: 8, height: 8, borderRadius: 4 },
  protectionDivider: { height: 1, backgroundColor: "#60a5fa" + "11", marginVertical: 10 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#0d1b36",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#60a5fa" + "22",
  },
  statVal: { color: "#60a5fa", fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  statLabel: { color: "#475569", fontSize: 10, textAlign: "center", marginTop: 4, lineHeight: 13 },
  disableBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#60a5fa" + "44",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: "#60a5fa" + "11",
  },
  disableBtnText: { color: "#60a5fa", fontSize: 14, fontWeight: "700" },
});

export default function Home() {
  const [nightMode, setNightMode] = useState(false);
  const [riskData, setRiskData] = useState({ score: 0, level: "Loading...", incidentCount: 0 });
  const tipIndex = new Date().getHours() % TIPS.length;

  useEffect(() => {
    const fetchRiskScore = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setRiskData({ score: 0, level: "Location Denied", incidentCount: 0 });
          return;
        }

        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const token = await SecureStore.getItemAsync("session_token");

        const response = await fetch(`${BASE_URL}/api/risk/score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: token ? `session_token=${token}` : "",
          },
          body: JSON.stringify({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setRiskData({
            score: data.score,
            level: data.level,
            incidentCount: data.incident_count,
          });
        }
      } catch (err) {
        console.log("Failed to fetch dynamic risk score", err);
        setRiskData({ score: 0, level: "Offline", incidentCount: 0 });
      }
    };
    
    fetchRiskScore();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"} 👋</Text>
            <Text style={styles.appName}>SafeHer</Text>
            <Text style={styles.tagline}>Your AI-powered safety companion</Text>
          </View>
          <TouchableOpacity
            style={[styles.nightBtn, nightMode && styles.nightBtnActive]}
            onPress={() => setNightMode(!nightMode)}
          >
            <Ionicons name="moon" size={20} color={nightMode ? "#000" : "#60a5fa"} />
          </TouchableOpacity>
        </View>

        {/* Risk Status Card */}
        <View style={styles.riskCard}>
          <View style={styles.riskLeft}>
            <Text style={styles.riskLabel}>AREA RISK LEVEL</Text>
            <Text style={styles.riskValue}>{riskData.level}</Text>
            <Text style={styles.riskDesc}>{riskData.incidentCount} incidents reported nearby</Text>
          </View>
          <View style={styles.riskScore}>
            <Text style={styles.riskNumber}>{riskData.score}</Text>
            <Text style={styles.riskMax}>/100</Text>
          </View>
        </View>

        {/* Safety Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color="#fad047" />
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>

        {/* Features Grid */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.grid}>
          {FEATURES.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.featureCard,
                f.title === "Night Mode" && nightMode && styles.featureCardActive,
              ]}
              onPress={() => f.title === "Night Mode" && setNightMode(!nightMode)}
              activeOpacity={0.8}
            >
              <View style={styles.featureTop}>
                <View style={[styles.iconBox, { backgroundColor: f.color + "22" }]}>
                  <Ionicons name={f.icon as any} size={22} color={f.color} />
                </View>
                {f.title === "Night Mode" && nightMode ? (
                  <View style={[styles.badge, { backgroundColor: "#60a5fa33" }]}>
                    <Text style={[styles.badgeText, { color: "#60a5fa" }]}>ON</Text>
                  </View>
                ) : f.badge ? (
                  <View style={[styles.badge, { backgroundColor: f.color + "33" }]}>
                    <Text style={[styles.badgeText, { color: f.color }]}>{f.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {[
            { icon: "alert-circle-outline", color: "#f97316", text: "Unsafe area marked 0.3km away", time: "2m ago" },
            { icon: "checkmark-circle-outline", color: "#4ade80", text: "Safe route calculated", time: "1h ago" },
            { icon: "people-outline", color: "#a78bfa", text: "Community report verified", time: "3h ago" },
          ].map((item, i) => (
            <View key={i}>
              <View style={styles.activityRow}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={styles.activityText}>{item.text}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
              {i < 2 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* SOS Button */}
      <SOSButton />

      {/* Night Protection Overlay */}
      {nightMode && <NightProtectionOverlay onDisable={() => setNightMode(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  scroll: { paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting: { color: "#666", fontSize: 14, fontWeight: "500" },
  appName: { color: "#fff", fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  tagline: { color: "#444", fontSize: 12, marginTop: 2 },
  nightBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#111", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#222" },
  nightBtnActive: { backgroundColor: "#60a5fa" },
  riskCard: { backgroundColor: "#111", borderRadius: 20, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#fad047" + "44" },
  riskLeft: {},
  riskLabel: { color: "#f97316", fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  riskValue: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 4 },
  riskDesc: { color: "#666", fontSize: 12, marginTop: 2 },
  riskScore: { flexDirection: "row", alignItems: "flex-end" },
  riskNumber: { color: "#f97316", fontSize: 48, fontWeight: "900", lineHeight: 52 },
  riskMax: { color: "#444", fontSize: 16, marginBottom: 8 },
  tipCard: { backgroundColor: "#fad047" + "11", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 24, borderWidth: 1, borderColor: "#fad047" + "33" },
  tipText: { color: "#fad047", fontSize: 13, marginLeft: 10, flex: 1, lineHeight: 18 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  featureCard: { backgroundColor: "#111", borderRadius: 16, padding: 14, width: (width - 52) / 2, borderWidth: 1, borderColor: "#1a1a1a" },
  featureCardActive: { borderColor: "#60a5fa" + "55", backgroundColor: "#60a5fa" + "0d" },
  featureTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  featureTitle: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  featureDesc: { color: "#555", fontSize: 11, lineHeight: 15 },
  activityCard: { backgroundColor: "#111", borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#1a1a1a" },
  activityRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  activityText: { color: "#ccc", fontSize: 13, flex: 1, marginLeft: 10 },
  activityTime: { color: "#444", fontSize: 11 },
  divider: { height: 1, backgroundColor: "#1a1a1a", marginVertical: 10 },
});