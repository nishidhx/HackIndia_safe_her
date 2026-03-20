import SOSButton from "@/components/SOSButton";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Heatmap, Marker } from "react-native-maps";

interface UnsafePoint {
  latitude: number;
  longitude: number;
  weight: number;
  description?: string;
  severity?: "low" | "medium" | "high" | "critical";
  incidentType?: string;
}

const INCIDENT_TYPES = [
  "Theft / Robbery",
  "Assault",
  "Harassment",
  "Vandalism",
  "Suspicious Activity",
  "Poor Lighting",
  "Other",
];

const SEVERITY_LEVELS: { label: string; value: UnsafePoint["severity"]; color: string }[] = [
  { label: "Low", value: "low", color: "#4ade80" },
  { label: "Medium", value: "medium", color: "#facc15" },
  { label: "High", value: "high", color: "#fb923c" },
  { label: "Critical", value: "critical", color: "#f87171" },
];

export default function Map() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [unsafePoints, setUnsafePoints] = useState<UnsafePoint[]>([
    { latitude: 28.47674989556479, longitude: 77.5016687437892, weight: 1 },
    { latitude: 28.47674989556479, longitude: 77.5016687437892, weight: 1 },
    { latitude: 28.48709375534753, longitude: 77.49297436326742, weight: 1 },
    { latitude: 28.532757586356368, longitude: 77.43741173297167, weight: 1 },
    { latitude: 28.470910619352384, longitude: 77.46224496513605, weight: 1 },
    { latitude: 28.469876415203885, longitude: 77.50207241624594, weight: 1 },
    { latitude: 28.469876415203885, longitude: 77.50207241624594, weight: 1 },
    { latitude: 28.474668623917676, longitude: 77.46364071965218, weight: 1 },
    { latitude: 28.472717578708096, longitude: 77.4640990421176, weight: 1 },
    { latitude: 28.472717578708096, longitude: 77.4640990421176, weight: 1 },
    { latitude: 28.48709375534753, longitude: 77.49297436326742, weight: 1 },
    { latitude: 28.48709375534753, longitude: 77.49297436326742, weight: 1 },
    { latitude: 28.532757586356368, longitude: 77.43741173297167, weight: 1 },
    { latitude: 28.532757586356368, longitude: 77.43741173297167, weight: 1 },
    { latitude: 28.532757586356368, longitude: 77.43741173297167, weight: 1 },
    { latitude: 28.39667069021716, longitude: 77.52965155988932, weight: 1 },
    { latitude: 28.39667069021716, longitude: 77.52965155988932, weight: 1 },
    { latitude: 28.402563906173636, longitude: 77.53503207117319, weight: 1 },
    { latitude: 28.402563906173636, longitude: 77.53503207117319, weight: 1 },
    { latitude: 28.402563906173636, longitude: 77.53503207117319, weight: 1 },
    { latitude: 28.402563906173636, longitude: 77.53503207117319, weight: 1 },
    { latitude: 28.39825270670317, longitude: 77.53301806747913, weight: 1 },
    { latitude: 28.39825270670317, longitude: 77.53301806747913, weight: 1 },
    { latitude: 28.39825270670317, longitude: 77.53301806747913, weight: 1 },
    { latitude: 28.39825270670317, longitude: 77.53301806747913, weight: 1 },
    { latitude: 28.473734956023204, longitude: 77.48913243412971, weight: 1 },
    { latitude: 28.473734956023204, longitude: 77.48913243412971, weight: 1 },
    { latitude: 28.473734956023204, longitude: 77.48913243412971, weight: 1 },
    { latitude: 28.473734956023204, longitude: 77.48913243412971, weight: 1 },
    { latitude: 28.473803036252736, longitude: 77.48927190899849, weight: 1 },
    { latitude: 28.473803036252736, longitude: 77.48927190899849, weight: 1 },
    { latitude: 28.473803036252736, longitude: 77.48927190899849, weight: 1 },
    { latitude: 28.475649143154175, longitude: 77.48967222869396, weight: 1 },
    { latitude: 28.475649143154175, longitude: 77.48967222869396, weight: 1 },
    { latitude: 28.475649143154175, longitude: 77.48967222869396, weight: 1 },
    { latitude: 28.46372285333167, longitude: 77.49638479202986, weight: 1 },
    { latitude: 28.46723088140974, longitude: 77.49936506152153, weight: 1 },
    { latitude: 28.464670167971637, longitude: 77.49327979981899, weight: 1 },
  ]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<UnsafePoint | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Form state
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<UnsafePoint["severity"]>("medium");
  const [incidentType, setIncidentType] = useState("");

  // New point pending (from long press) — needs form fill before adding
  const [pendingPoint, setPendingPoint] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleLongPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPendingPoint({ latitude, longitude });
    setSelectedPoint(null);
    setSelectedIndex(null);
    // Reset form
    setDescription("");
    setSeverity("medium");
    setIncidentType("");
    setModalVisible(true);
  };

  const handleMarkerPress = (point: UnsafePoint, index: number) => {
    setSelectedPoint(point);
    setSelectedIndex(index);
    setPendingPoint(null);
    // Pre-fill form with existing data
    setDescription(point.description ?? "");
    setSeverity(point.severity ?? "medium");
    setIncidentType(point.incidentType ?? "");
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!incidentType) {
      Alert.alert("Required", "Please select an incident type.");
      return;
    }

    if (pendingPoint) {
      // Adding a new point
      setUnsafePoints((prev) => [
        ...prev,
        {
          latitude: pendingPoint.latitude,
          longitude: pendingPoint.longitude,
          weight: 1,
          description,
          severity,
          incidentType,
        },
      ]);
    } else if (selectedIndex !== null) {
      // Updating existing point
      setUnsafePoints((prev) =>
        prev.map((p, i) =>
          i === selectedIndex ? { ...p, description, severity, incidentType } : p
        )
      );
    }

    setModalVisible(false);
    setPendingPoint(null);
    setSelectedPoint(null);
    setSelectedIndex(null);
  };

  const handleDelete = () => {
    if (selectedIndex !== null) {
      Alert.alert("Delete Point", "Remove this incident report?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setUnsafePoints((prev) => prev.filter((_, i) => i !== selectedIndex));
            setModalVisible(false);
          },
        },
      ]);
    }
  };

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#363e52" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
    { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0c160f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#211d1d" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ffffff49" }] },
    { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4644440f" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const validPoints = unsafePoints.filter(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
  );

  const getMarkerColor = (point: UnsafePoint) => {
    switch (point.severity) {
      case "low": return "#4ade80";
      case "medium": return "#facc15";
      case "high": return "#fb923c";
      case "critical": return "#f87171";
      default: return "#6366f1";
    }
  };

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1a1f2e" }}>
        <Text style={{ color: "#fff", fontFamily: "System", fontSize: 16 }}>Getting location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={Styles.map}
        customMapStyle={darkMapStyle}
        onLongPress={handleLongPress}
        showsUserLocation
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {unsafePoints.map((point, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: point.latitude ?? 0.01, longitude: point.longitude ?? 0.01 }}
            pinColor={getMarkerColor(point)}
            onPress={() => handleMarkerPress(point, index)}
          />
        ))}
        {unsafePoints.length > 0 && <Heatmap points={validPoints} radius={40} />}
      </MapView>

      {/* Incident Report Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={Styles.modalOverlay}>
          <View style={Styles.modalBox}>
            {/* Header */}
            <View style={Styles.modalHeader}>
              <View style={Styles.modalHeaderLeft}>
                <View style={Styles.warningDot} />
                <Text style={Styles.modalTitle}>
                  {selectedPoint ? "Incident Details" : "Report Incident"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={Styles.closeBtn}>
                <Text style={Styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Severity */}
              <Text style={Styles.label}>SEVERITY</Text>
              <View style={Styles.severityRow}>
                {SEVERITY_LEVELS.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      Styles.severityChip,
                      { borderColor: s.color },
                      severity === s.value && { backgroundColor: s.color },
                    ]}
                    onPress={() => setSeverity(s.value)}
                  >
                    <Text
                      style={[
                        Styles.severityChipText,
                        severity === s.value && { color: "#111" },
                        severity !== s.value && { color: s.color },
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Incident Type */}
              <Text style={Styles.label}>INCIDENT TYPE</Text>
              <View style={Styles.incidentGrid}>
                {INCIDENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      Styles.incidentChip,
                      incidentType === type && Styles.incidentChipSelected,
                    ]}
                    onPress={() => setIncidentType(type)}
                  >
                    <Text
                      style={[
                        Styles.incidentChipText,
                        incidentType === type && Styles.incidentChipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <Text style={Styles.label}>DESCRIPTION</Text>
              <TextInput
                style={Styles.textInput}
                placeholder="Describe what happened..."
                placeholderTextColor="#4a5568"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Buttons */}
              <View style={Styles.buttonRow}>
                {selectedIndex !== null && (
                  <TouchableOpacity style={Styles.deleteBtn} onPress={handleDelete}>
                    <Text style={Styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[Styles.submitBtn, !incidentType && Styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                >
                  <Text style={Styles.submitBtnText}>
                    {selectedPoint ? "Update" : "Report"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SOSButton />
    </View>
  );
}

const Styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBox: {
    backgroundColor: "#1a1f2e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderColor: "#2d3548",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  warningDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f87171",
  },
  modalTitle: {
    color: "#f1f5f9",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2d3548",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  label: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 4,
  },
  severityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  severityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
  },
  severityChipText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  incidentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  incidentChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#242b3d",
    borderWidth: 1,
    borderColor: "#2d3548",
  },
  incidentChipSelected: {
    backgroundColor: "#312e81",
    borderColor: "#6366f1",
  },
  incidentChipText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
  },
  incidentChipTextSelected: {
    color: "#a5b4fc",
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#242b3d",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2d3548",
    color: "#e2e8f0",
    fontSize: 14,
    padding: 14,
    marginBottom: 20,
    minHeight: 100,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f87171",
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#f87171",
    fontWeight: "700",
    fontSize: 15,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#2d3548",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});