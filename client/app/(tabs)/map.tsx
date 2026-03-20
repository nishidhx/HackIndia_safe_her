import SOSButton from "@/components/SOSButton";
import * as Location from "expo-location";
import React, { useEffect } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import MapView, { Heatmap, Marker } from "react-native-maps";

interface unSafePoint {
  latitude: number;
  longitude: number;
  weight: number;
}

export default function Map() {
  const [location, setLocation] =
    React.useState<Location.LocationObject | null>(null);
  const [unSafePoint, setUnsafePoint] = React.useState<unSafePoint[]>([
  { latitude: 28.598130238854658, longitude: 77.39189967513084, weight: 1 },
  { latitude: 28.59839046335287, longitude: 77.39106617867947, weight: 1 },
  { latitude: 28.59947168335507, longitude: 77.39151075482368, weight: 1 },
  { latitude: 28.599179080945664, longitude: 77.39158485084772, weight: 1 },
  { latitude: 28.5985, longitude: 77.3912, weight: 2 },
  { latitude: 28.5992, longitude: 77.3918, weight: 1 },
  { latitude: 28.5978, longitude: 77.3925, weight: 3 },
  { latitude: 28.5969, longitude: 77.3908, weight: 1 },
  { latitude: 28.6001, longitude: 77.3921, weight: 2 },
  { latitude: 28.5975, longitude: 77.3915, weight: 1 },
]);
  const [locationStatus, setLocationStatus] = React.useState(false);

  const handleLongPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    console.log("long pressed at: ", latitude, longitude)
    setUnsafePoint((prev) => [
      ...prev,
      {
        latitude: latitude ? latitude : 0.01,
        longitude: longitude ? longitude : 0.01,
        weight: 1,
      },
    ]);
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
        setLocationStatus(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocationStatus(true);
      setLocation(loc);
    })();
  }, []);

  const validPoints = unSafePoint.filter(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
  );

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Getting location...</Text>
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
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {unSafePoint.map((point, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: point.latitude ?? 0.01,
              longitude: point.longitude ?? 0.01,
            }}
            pinColor="blue"
          />
        ))}

        {unSafePoint.length > 0 && <Heatmap points={validPoints} radius={40} />}
      </MapView>
      <SOSButton />
    </View>
  );
}

const Styles = StyleSheet.create({
  AboutContainer: {
    fontWeight: "bold",
    backgroundColor: "grey",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
