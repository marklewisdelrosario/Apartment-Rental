import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { supabase } from "../services/supabase";

export default function HomeScreen({ navigation }) {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApartments = async () => {
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .eq("status", "Available");

    if (error) {
      console.log("Apartment error:", error.message);
      return;
    }

    setApartments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadApartments();
  }, []);

  const renderApartment = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ApartmentDetails", {
          apartment: item,
        })
      }
    >
      <View style={styles.image}>
        <Text style={styles.house}>🏠</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.location}>
          📍 {item.location}
        </Text>

        <Text style={styles.details}>
          🛏️ {item.bedrooms} Bedroom • 🚿 {item.bathrooms} Bathroom
        </Text>

        <Text style={styles.price}>
          ₱{Number(item.price).toLocaleString()} / month
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          Loading apartments...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Your Next Home 🏠</Text>

      <Text style={styles.subtitle}>
        Available apartments
      </Text>

      <FlatList
        data={apartments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderApartment}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No apartments available.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
  },

  subtitle: {
    color: "#777",
    marginTop: 5,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE",
  },

  image: {
    height: 140,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  house: {
    fontSize: 60,
  },

  info: {
    padding: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  location: {
    color: "#666",
    marginBottom: 6,
  },

  details: {
    color: "#666",
    marginBottom: 10,
  },

  price: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2563EB",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
    fontSize: 16,
  },
});