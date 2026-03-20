import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function Settings() {
  const [name, setName] = useState("Nishidh");
  const [phone, setPhone] = useState("+91 9876543210");
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "Mom", phone: "+91 9876543211", relationship: "Mother" },
    { id: "2", name: "Dad", phone: "+91 9876543212", relationship: "Father" },
  ]);
  const [sosVibration, setSosVibration] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert("Error", "Name and phone are required");
      return;
    }
    setContacts((prev) => [...prev, { ...newContact, id: Date.now().toString() }]);
    setNewContact({ name: "", phone: "", relationship: "" });
    setAddingContact(false);
  };

  const removeContact = (id: string) => {
    Alert.alert("Remove Contact", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setContacts((prev) => prev.filter((c) => c.id !== id)) },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your safety preferences</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="person-circle-outline" size={16} color="#f97316" /> Profile
        </Text>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#666"
            />
          </View>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="call-outline" size={16} color="#f97316" /> Emergency Contacts
        </Text>
        <Text style={styles.sectionDesc}>These contacts will be notified during SOS</Text>

        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>{contact.name.charAt(0)}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
            </View>
            <TouchableOpacity onPress={() => removeContact(contact.id)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={18} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}

        {addingContact && (
          <View style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact name"
              placeholderTextColor="#666"
              value={newContact.name}
              onChangeText={(t) => setNewContact((p) => ({ ...p, name: t }))}
            />
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 XXXXXXXXXX"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={newContact.phone}
              onChangeText={(t) => setNewContact((p) => ({ ...p, phone: t }))}
            />
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mother, Friend"
              placeholderTextColor="#666"
              value={newContact.relationship}
              onChangeText={(t) => setNewContact((p) => ({ ...p, relationship: t }))}
            />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.saveBtn, { flex: 1, marginRight: 8 }]} onPress={addContact}>
                <Text style={styles.saveBtnText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1, backgroundColor: "#222" }]}
                onPress={() => setAddingContact(false)}
              >
                <Text style={[styles.saveBtnText, { color: "#fff" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setAddingContact(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#f97316" />
          <Text style={styles.addBtnText}>Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#f97316" /> Safety Preferences
        </Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>SOS Vibration</Text>
              <Text style={styles.toggleDesc}>Vibrate on SOS trigger</Text>
            </View>
            <Switch
              value={sosVibration}
              onValueChange={setSosVibration}
              trackColor={{ false: "#333", true: "#f97316" }}
              thumbColor="#000"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Live Location Sharing</Text>
              <Text style={styles.toggleDesc}>Share location during SOS</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: "#333", true: "#f97316" }}
              thumbColor="#000"
            />
          </View>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="information-circle-outline" size={16} color="#f97316" /> About
        </Text>
        <View style={styles.card}>
          {[
            { label: "App Version", value: "1.0.0" },
            { label: "Build", value: "2026.03.08" },
            { label: "Team", value: "Aurenith" },
          ].map((item) => (
            <View key={item.label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
              <View style={styles.divider} />
            </View>
          ))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={20} color="#ff4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#f97316", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  sectionDesc: { fontSize: 12, color: "#666", marginBottom: 12 },
  card: { backgroundColor: "#111", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1a1a1a" },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#f97316", justifyContent: "center", alignItems: "center", marginBottom: 16, alignSelf: "center" },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#000" },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, color: "#666", marginBottom: 6, fontWeight: "600", letterSpacing: 0.5 },
  input: { backgroundColor: "#1a1a1a", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "#222" },
  saveBtn: { backgroundColor: "#f97316", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 8 },
  saveBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
  contactCard: { backgroundColor: "#111", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: "#1a1a1a" },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f97316", justifyContent: "center", alignItems: "center", marginRight: 12 },
  contactAvatarText: { fontSize: 18, fontWeight: "800", color: "#000" },
  contactInfo: { flex: 1 },
  contactName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  contactPhone: { color: "#888", fontSize: 13, marginTop: 2 },
  contactRelation: { color: "#f97316", fontSize: 11, fontWeight: "600", marginTop: 2 },
  removeBtn: { padding: 8 },
  addBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 14, justifyContent: "center", borderWidth: 1.5, borderColor: "#f97316", borderRadius: 12, borderStyle: "dashed", marginTop: 4 },
  addBtnText: { color: "#f97316", marginLeft: 8, fontWeight: "600", fontSize: 14 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  toggleLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
  toggleDesc: { color: "#666", fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "#1a1a1a", marginVertical: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  infoLabel: { color: "#666", fontSize: 14 },
  infoValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 20, paddingVertical: 16, borderRadius: 12, borderWidth: 1.5, borderColor: "#ff4444", marginBottom: 20 },
  logoutText: { color: "#ff4444", fontWeight: "700", fontSize: 15, marginLeft: 8 },
  row: { flexDirection: "row", marginTop: 8 },
});