import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import { Feather } from "@expo/vector-icons";

export default function ApartmentDetailsScreen({ route, navigation }) {
  const { apartment } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Apartment Image */}
        <View style={styles.imageContainer}>
          <View style={styles.houseCircle}>
            <Feather name="home" size={65} color="#2563EB" />
          </View>

          {/* Available Badge */}
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />
            <Text style={styles.availableText}>Available</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{apartment.title}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={18} color="#2563EB" />

            <Text style={styles.location}>
              {apartment.location}
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Monthly Rent</Text>

              <Text style={styles.price}>
                ₱{Number(apartment.price).toLocaleString()}
              </Text>
            </View>

            <View style={styles.priceIcon}>
              <Feather name="credit-card" size={23} color="#2563EB" />
            </View>
          </View>

          {/* Apartment Features */}
          <Text style={styles.sectionTitle}>Apartment Details</Text>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather name="home" size={21} color="#2563EB" />
              </View>

              <Text style={styles.featureValue}>
                {apartment.bedrooms}
              </Text>

              <Text style={styles.featureLabel}>
                Bedroom{apartment.bedrooms !== 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather name="droplet" size={21} color="#2563EB" />
              </View>

              <Text style={styles.featureValue}>
                {apartment.bathrooms}
              </Text>

              <Text style={styles.featureLabel}>
                Bathroom{apartment.bathrooms !== 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather name="check-circle" size={21} color="#22C55E" />
              </View>

              <Text style={styles.featureValue}>
                Ready
              </Text>

              <Text style={styles.featureLabel}>
                Status
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>

          <View style={styles.descriptionCard}>
            <Text style={styles.description}>
              {apartment.description ||
                "This apartment provides a comfortable and convenient living space suitable for tenants looking for a new home."}
            </Text>
          </View>

          {/* Location Information */}
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Feather name="map-pin" size={24} color="#2563EB" />
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>
                Apartment Location
              </Text>

              <Text style={styles.locationValue}>
                {apartment.location}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Booking Button */}
      <View style={styles.bottomContainer}>
        <View>
          <Text style={styles.bottomLabel}>Monthly Rent</Text>

          <Text style={styles.bottomPrice}>
            ₱{Number(apartment.price).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("Booking", {
              apartment: apartment,
            })
          }
        >
          <Text style={styles.bookButtonText}>
            Book This Apartment
          </Text>

          <Feather
            name="arrow-right"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  scrollContent: {
    paddingBottom: 120,
  },

  imageContainer: {
    height: 260,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  houseCircle: {
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  availableBadge: {
    position: "absolute",
    top: 18,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 7,
  },

  availableText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  location: {
    fontSize: 15,
    color: "#666",
    marginLeft: 8,
  },

  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EBF0",
    marginBottom: 25,
  },

  priceLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },

  price: {
    fontSize: 25,
    fontWeight: "800",
    color: "#2563EB",
  },

  priceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 13,
  },

  featuresContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E8EBF0",
  },

  feature: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
  },

  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  featureValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
    marginBottom: 3,
  },

  featureLabel: {
    fontSize: 11,
    color: "#888",
  },

  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8EBF0",
    marginBottom: 25,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E8EBF0",
  },

  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  locationInfo: {
    flex: 1,
  },

  locationTitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },

  locationValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bottomLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
  },

  bottomPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },

  bookButton: {
    height: 50,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 8,
  },
});