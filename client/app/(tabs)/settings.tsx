import React, { useState, useEffect } from "react";
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function Settings() {
  const [activeScreen, setActiveScreen] = useState<string>("main"); // main, profile, contacts, voice, trip, guardian, tactical, prefs

  // Free Tier States
  const [name, setName] = useState("Sanika");
  const [phone, setPhone] = useState("+91 9876543210");
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "Mom", phone: "+91 9876543211", relationship: "Mother" },
  ]);
  const [sosVibration, setSosVibration] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });
  const [searchQuery, setSearchQuery] = useState("");
  
  // Premium Tier States
  const [isPremium, setIsPremium] = useState(false);
  const [sosKeyword, setSosKeyword] = useState("Bachao");
  const [tripMode, setTripMode] = useState(false);
  const [guardianOnDemand, setGuardianOnDemand] = useState(false);

  // New Tactical Features
  const [fakeCall, setFakeCall] = useState(false);
  const [loudSiren, setLoudSiren] = useState(false);
  const [lowBatterySOS, setLowBatterySOS] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedName = await SecureStore.getItemAsync("settings_name");
        if (savedName) setName(savedName);
        const savedPhone = await SecureStore.getItemAsync("settings_phone");
        if (savedPhone) setPhone(savedPhone);
        const savedContacts = await SecureStore.getItemAsync("settings_contacts");
        if (savedContacts) setContacts(JSON.parse(savedContacts));

        const savedPremium = await SecureStore.getItemAsync("settings_is_premium");
        if (savedPremium === "true") setIsPremium(true);

        const savedKeyword = await SecureStore.getItemAsync("settings_sos_keyword");
        if (savedKeyword) setSosKeyword(savedKeyword);
        const savedTrip = await SecureStore.getItemAsync("settings_trip_mode");
        if (savedTrip === "true") setTripMode(true);
        const savedGuardian = await SecureStore.getItemAsync("settings_guardian");
        if (savedGuardian === "true") setGuardianOnDemand(true);

        const savedTactical = await SecureStore.getItemAsync("settings_tactical");
        if (savedTactical) {
          const t = JSON.parse(savedTactical);
          setFakeCall(t.fakeCall ?? false);
          setLoudSiren(t.loudSiren ?? false);
          setLowBatterySOS(t.lowBatterySOS ?? true);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    loadSettings();
  }, []);

  const saveProfile = async () => {
    try {
      await SecureStore.setItemAsync("settings_name", name);
      await SecureStore.setItemAsync("settings_phone", phone);
      Alert.alert("Success", "Profile updated.");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
    }
  };

  const saveKeyword = async () => {
    try {
      await SecureStore.setItemAsync("settings_sos_keyword", sosKeyword);
      Alert.alert("Authorized", "Voice trigger keyword committed.");
    } catch (error) {
      Alert.alert("Error", "Failed to save keyword");
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) return Alert.alert("Error", "Name and phone are required");
    const updatedContacts = [...contacts, { ...newContact, id: Date.now().toString() }];
    setContacts(updatedContacts);
    setNewContact({ name: "", phone: "", relationship: "" });
    setAddingContact(false);
    await SecureStore.setItemAsync("settings_contacts", JSON.stringify(updatedContacts));
  };

  const removeContact = (id: string) => {
    Alert.alert("Remove Contact", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
        const updatedContacts = contacts.filter((c) => c.id !== id);
        setContacts(updatedContacts);
        await SecureStore.setItemAsync("settings_contacts", JSON.stringify(updatedContacts));
      }},
    ]);
  };

  const saveTactical = async (key: string, val: boolean) => {
    const t = { fakeCall, loudSiren, lowBatterySOS, [key]: val };
    if (key === 'fakeCall') setFakeCall(val);
    if (key === 'loudSiren') setLoudSiren(val);
    if (key === 'lowBatterySOS') setLowBatterySOS(val);
    await SecureStore.setItemAsync("settings_tactical", JSON.stringify(t));
  };

  const buyPremium = async () => {
    setIsPremium(true);
    await SecureStore.setItemAsync("settings_is_premium", "true");
    Alert.alert("PRO Enabled", "All SafeHer tactical assets unleashed.", [{ text: "Command Accept" }]);
  };


  // --- Helper Components ---
  const TileGroup = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.tileGroup}>{children}</View>
  );

  const Tile = ({ icon, title, sub, onPress }: { icon: any, title: string, sub: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.tileIconBg}>
        <Ionicons name={icon} size={22} color="#cccccc" />
      </View>
      <View style={styles.tileTextContainer}>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileSub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );

  // --- SUB SCREENS ---
  const SubHeader = ({ title }: { title: string }) => (
    <View style={styles.subHeader}>
      <TouchableOpacity onPress={() => setActiveScreen("main")} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.subHeaderTitle}>{title}</Text>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.subScreen}>
      <SubHeader title="Profile Information" />
      <View style={styles.internalCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#666" />
        <Text style={[styles.label, { marginTop: 16 }]}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#666" />
        <TouchableOpacity style={styles.primaryBtn} onPress={saveProfile}><Text style={styles.primaryBtnText}>Save Changes</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderContacts = () => (
    <View style={styles.subScreen}>
      <SubHeader title="Emergency Contacts" />
      <Text style={styles.sectionDesc}>Synced immediately during SOS broadcast.</Text>
      {contacts.map((contact) => (
        <View key={contact.id} style={styles.contactCard}>
          <View style={styles.contactAvatar}><Text style={styles.contactAvatarText}>{contact.name.charAt(0)}</Text></View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactPhone}>{contact.phone} • {contact.relationship}</Text>
          </View>
          <TouchableOpacity onPress={() => removeContact(contact.id)} style={styles.removeBtn}><Ionicons name="trash-outline" size={18} color="#ff4444" /></TouchableOpacity>
        </View>
      ))}

      {addingContact ? (
        <View style={styles.internalCard}>
          <TextInput style={[styles.input, {marginBottom:12}]} placeholder="Name" placeholderTextColor="#666" value={newContact.name} onChangeText={(t) => setNewContact((p) => ({ ...p, name: t }))} />
          <TextInput style={[styles.input, {marginBottom:12}]} placeholder="+91 XXXXXXXXXX" placeholderTextColor="#666" keyboardType="phone-pad" value={newContact.phone} onChangeText={(t) => setNewContact((p) => ({ ...p, phone: t }))} />
          <TextInput style={styles.input} placeholder="Relationship (optional)" placeholderTextColor="#666" value={newContact.relationship} onChangeText={(t) => setNewContact((p) => ({ ...p, relationship: t }))} />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginRight: 8 }]} onPress={addContact}><Text style={styles.primaryBtnText}>Add</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: "#222" }]} onPress={() => setAddingContact(false)}><Text style={[styles.primaryBtnText, { color: "#fff" }]}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddingContact(true)}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add Contact</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderVoice = () => (
    <View style={styles.subScreen}>
      <SubHeader title="Voice-Activated SOS" />
      <View style={styles.internalCard}>
        <Text style={styles.label}>SafeWord Override</Text>
        <Text style={styles.sectionDesc}>Aural injection word triggering emergency protocols silently.</Text>
        <TextInput style={[styles.input, { marginTop: 12 }]} value={sosKeyword} onChangeText={setSosKeyword} placeholder="Bachao" placeholderTextColor="#666" autoCapitalize="none" />
        <TouchableOpacity style={styles.primaryBtn} onPress={saveKeyword}><Text style={styles.primaryBtnText}>Set SafeWord</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderTrip = () => (
    <View style={styles.subScreen}>
      <SubHeader title="Trip Mode" />
      <View style={styles.internalCard}>
        <Text style={styles.label}>Snatch Detection Analytics</Text>
        <Text style={styles.sectionDesc}>Aggressively monitors gyroscopic forces to detect mobile snatches. Simulates phone shutdown while pushing video telemetry.</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Armed</Text>
          <Switch value={tripMode} onValueChange={(v) => { setTripMode(v); SecureStore.setItemAsync("settings_trip_mode", v ? "true" : "false"); }} trackColor={{ false: "#333", true: "#f97316" }} thumbColor="#fff" />
        </View>
      </View>
    </View>
  );

  const renderGuardian = () => (
    <View style={styles.subScreen}>
      <SubHeader title="Guardian Network" />
      <View style={styles.internalCard}>
        <Text style={styles.label}>Volunteer Proxies</Text>
        <Text style={styles.sectionDesc}>When traveling vulnerable routes, dispatch a real-time tracking proxy or physical escort to trace you.</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Enable Cloud Proxy</Text>
          <Switch value={guardianOnDemand} onValueChange={(v) => { setGuardianOnDemand(v); SecureStore.setItemAsync("settings_guardian", v ? "true" : "false"); }} trackColor={{ false: "#333", true: "#f97316" }} thumbColor="#fff" />
        </View>
      </View>
    </View>
  );

  const renderTactical = () => (
    <View style={styles.subScreen}>
      <SubHeader title="Tactical Defense" />
      <Text style={styles.sectionDesc}>Hard overrides for physical threats.</Text>
      <View style={styles.internalCard}>
        <View style={styles.toggleRow}>
          <View><Text style={styles.toggleLabel}>Fake Incoming Call</Text><Text style={styles.sectionDesc}>Press power 3x to ring</Text></View>
          <Switch value={fakeCall} onValueChange={(v) => saveTactical('fakeCall', v)} trackColor={{ false: "#333", true: "#10b981" }} thumbColor="#fff" />
        </View>
        <View style={styles.divider} />
        <View style={styles.toggleRow}>
          <View><Text style={styles.toggleLabel}>Deterrent Siren</Text><Text style={styles.sectionDesc}>Shake device vigorously</Text></View>
          <Switch value={loudSiren} onValueChange={(v) => saveTactical('loudSiren', v)} trackColor={{ false: "#333", true: "#ef4444" }} thumbColor="#fff" />
        </View>
        <View style={styles.divider} />
        <View style={styles.toggleRow}>
          <View><Text style={styles.toggleLabel}>Dead Battery SOS</Text><Text style={styles.sectionDesc}>Fire pulse at 15%</Text></View>
          <Switch value={lowBatterySOS} onValueChange={(v) => saveTactical('lowBatterySOS', v)} trackColor={{ false: "#333", true: "#f97316" }} thumbColor="#fff" />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {activeScreen === "main" ? (
          <>
            <View style={styles.header}>
              <Text style={styles.brandingHeader}>SETTINGS</Text>
            </View>

            {/* Search Bar matching Nothing OS style */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Search settings" 
                placeholderTextColor="#777"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Premium CTA (Disappears upon checking out) */}
            {!isPremium && (
              <TouchableOpacity style={styles.proBanner} onPress={buyPremium}>
                <Ionicons name="shield-checkmark" size={24} color="#ffd700" />
                <View style={styles.proTextGroup}>
                  <Text style={styles.proTitle}>SafeHer Security Elite</Text>
                  <Text style={styles.proSub}>Touch to deploy native premium packages.</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Group 1: Core Identities */}
            <TileGroup>
              <Tile icon="person-outline" title="Profile Identity" sub={`${name} • ${phone}`} onPress={() => setActiveScreen("profile")} />
              <Tile icon="people-outline" title="Guardian Network" sub={isPremium ? "Active" : "Locked (PRO)"} onPress={() => setActiveScreen("guardian")} />
            </TileGroup>

            {/* Group 2: Comms */}
            <TileGroup>
              <Tile icon="call-outline" title="Emergency Contacts" sub={`${contacts.length} peers connected`} onPress={() => setActiveScreen("contacts")} />
              <Tile icon="mic-outline" title="Voice Triggers" sub={`Aural mapping: ${sosKeyword}`} onPress={() => setActiveScreen("voice")} />
            </TileGroup>

            {/* Group 3: Tactical */}
            <TileGroup>
              <Tile icon="walk-outline" title="Trip Analytics" sub="Snatch Detection & Gyro" onPress={() => setActiveScreen("trip")} />
              <Tile icon="warning-outline" title="Tactical Defense" sub="Sirens, Fakes, Battery Logic" onPress={() => setActiveScreen("tactical")} />
            </TileGroup>
            
            <Text style={styles.footerVersion}>SafeHer OS v1.0.0-hackindia</Text>
          </>
        ) : (
          <View style={styles.slideContainer}>
            {activeScreen === "profile" && renderProfile()}
            {activeScreen === "contacts" && renderContacts()}
            {activeScreen === "voice" && renderVoice()}
            {activeScreen === "trip" && renderTrip()}
            {activeScreen === "guardian" && renderGuardian()}
            {activeScreen === "tactical" && renderTactical()}
          </View>
        )}
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 50, paddingBottom: 60 },
  
  header: { marginBottom: 24, paddingLeft: 4 },
  brandingHeader: { color: "#FFF", fontSize: 24, fontWeight: "900", letterSpacing: 4 }, // Trying to simulate dot-matrix font with heavy weight and spacing
  
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1e1e", borderRadius: 24, paddingHorizontal: 16, height: 50, marginBottom: 24 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#fff", fontSize: 16, paddingRight: 10 },

  proBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#2d2400", borderRadius: 20, padding: 16, marginBottom: 12 },
  proTextGroup: { marginLeft: 16, flex: 1 },
  proTitle: { color: "#ffd700", fontSize: 16, fontWeight: "800" },
  proSub: { color: "#aa9000", fontSize: 13, marginTop: 2 },

  tileGroup: { marginBottom: 16, backgroundColor: "#1e1e1e", borderRadius: 24, overflow: "hidden" },
  tile: { flexDirection: "row", alignItems: "center", padding: 18, borderBottomWidth: 1, borderBottomColor: "#00000055" },
  tileIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#333", justifyContent: "center", alignItems: "center" },
  tileTextContainer: { flex: 1, marginLeft: 16 },
  tileTitle: { color: "#eeeeee", fontSize: 17, fontWeight: "500" },
  tileSub: { color: "#888888", fontSize: 13, marginTop: 2 },

  footerVersion: { textAlign: "center", color: "#444", marginTop: 20, fontSize: 12, fontWeight: "600", letterSpacing: 1 },

  subScreen: { flex: 1 },
  subHeader: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#222", justifyContent: "center", alignItems: "center", marginRight: 16 },
  subHeaderTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },

  internalCard: { backgroundColor: "#1e1e1e", borderRadius: 20, padding: 20 },
  sectionDesc: { color: "#888", fontSize: 14, marginBottom: 16, lineHeight: 20 },
  label: { color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 8 },
  input: { backgroundColor: "#000", borderRadius: 14, color: "#fff", fontSize: 16, padding: 16, borderWidth: 1, borderColor: "#333" },
  primaryBtn: { backgroundColor: "#eeeeee", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  primaryBtnText: { color: "#000", fontSize: 16, fontWeight: "800" },

  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#333", justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 24 },
  avatarText: { fontSize: 36, fontWeight: "900", color: "#fff" },

  contactCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1e1e", padding: 16, borderRadius: 16, marginBottom: 12 },
  contactAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#333", justifyContent: "center", alignItems: "center", marginRight: 14 },
  contactAvatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  contactInfo: { flex: 1 },
  contactName: { color: "#fff", fontSize: 17, fontWeight: "700" },
  contactPhone: { color: "#888", fontSize: 13, marginTop: 4 },
  removeBtn: { padding: 8 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: "#333", borderStyle: "dashed", marginTop: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 8 },

  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  toggleLabel: { color: "#fff", fontSize: 17, fontWeight: "600", marginBottom: 4 },
  divider: { height: 1, backgroundColor: "#333", marginVertical: 8 },
  row: { flexDirection: "row", marginTop: 16 },
  slideContainer: { paddingBottom: 40 },
});