import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApartments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .order("id", { ascending: true });

    if (!error) {
      setApartments(data || []);
    }

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadApartments();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.webContent,
        ]}
      >
        <View style={[styles.header, isWeb && styles.webHeader]}>
          <View>
            <Text style={styles.smallTitle}>GOOD DAY</Text>

            <Text style={[styles.heading, isWeb && styles.webHeading]}>
              Find your next home
            </Text>

            <Text style={styles.subtitle}>
              Comfortable spaces made for you
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}
          >
            <Feather name="user" size={20} color="#1769E0" />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.sectionHeader,
            isWeb && styles.webSectionHeader,
          ]}
        >
          <View>
            <Text style={styles.sectionTitle}>
              Apartments
            </Text>

            <Text style={styles.sectionSubtitle}>
              View available and unavailable apartments
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {apartments.length}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color="#1769E0"
            />

            <Text style={styles.loadingText}>
              Loading apartments...
            </Text>
          </View>
        ) : apartments.length === 0 ? (
          <View style={styles.empty}>
            <Feather
              name="home"
              size={40}
              color="#B8C4D4"
            />

            <Text style={styles.emptyTitle}>
              No apartments found
            </Text>

            <Text style={styles.emptyText}>
              Please check again later.
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.apartmentGrid,
              isWeb && styles.webGrid,
            ]}
          >
            {apartments.map((apartment) => {
              const isAvailable =
                apartment.status === "Available";

              return (
                <TouchableOpacity
                  key={apartment.id}
                  activeOpacity={0.9}
                  style={[
                    styles.card,
                    isWeb && styles.webCard,
                  ]}
                  onPress={() =>
                    navigation.navigate(
                      "ApartmentDetails",
                      { apartment }
                    )
                  }
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: apartment.image_url,
                      }}
                      style={styles.image}
                      resizeMode="cover"
                    />

                    <View
                      style={[
                        styles.statusBadge,
                        isAvailable
                          ? styles.availableBadge
                          : styles.unavailableBadge,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          isAvailable
                            ? styles.greenDot
                            : styles.redDot,
                        ]}
                      />

                      <Text style={styles.statusBadgeText}>
                        {isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardContent}>
                    <Text
                      style={styles.apartmentTitle}
                      numberOfLines={1}
                    >
                      {apartment.title}
                    </Text>

                    <View style={styles.locationRow}>
                      <Feather
                        name="map-pin"
                        size={13}
                        color="#1769E0"
                      />

                      <Text
                        style={styles.location}
                        numberOfLines={1}
                      >
                        {apartment.location}
                      </Text>
                    </View>

                    <View style={styles.features}>
                      {[
                        [
                          "bed",
                          apartment.bedrooms,
                          "Bedroom",
                        ],
                        [
                          "shower",
                          apartment.bathrooms,
                          "Bathroom",
                        ],
                      ].map(([icon, value, label]) => (
                        <View
                          style={styles.feature}
                          key={label}
                        >
                          <MaterialCommunityIcons
                            name={icon}
                            size={15}
                            color="#667085"
                          />

                          <Text style={styles.featureText}>
                            {value} {label}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.rateTitle}>
                      Rental Rates
                    </Text>

                    <View style={styles.rates}>
                      <View>
                        <Text style={styles.rateLabel}>
                          Daily
                        </Text>

                        <Text style={styles.rate}>
                          ₱
                          {Number(
                            apartment.daily_rate || 0
                          ).toLocaleString()}
                          <Text style={styles.rateUnit}>
                            {" "}
                            /day
                          </Text>
                        </Text>
                      </View>

                      <View style={styles.rateRight}>
                        <Text style={styles.rateLabel}>
                          Monthly
                        </Text>

                        <Text style={styles.rate}>
                          ₱
                          {Number(
                            apartment.price || 0
                          ).toLocaleString()}
                          <Text style={styles.rateUnit}>
                            {" "}
                            /month
                          </Text>
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.viewButton,
                        !isAvailable &&
                          styles.viewUnavailableButton,
                      ]}
                    >
                      <Text style={styles.viewButtonText}>
                        View Apartment
                      </Text>

                      <Feather
                        name="arrow-right"
                        size={15}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },

  scrollContent: {
    paddingBottom: 22,
  },

  webContent: {
    maxWidth: 1250,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 32,
  },

  header: {
    marginHorizontal: 20,
    marginTop: 13,
    paddingHorizontal: 17,
    paddingVertical: 14,
    backgroundColor: "#1769E0",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  webHeader: {
    marginHorizontal: 0,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  smallTitle: {
    fontSize: 8,
    fontWeight: "800",
    color: "#DCEAFF",
    letterSpacing: 1.3,
    marginBottom: 2,
  },

  heading: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  webHeading: {
    fontSize: 24,
  },

  subtitle: {
    fontSize: 10,
    color: "#D9E8FF",
    marginTop: 2,
  },

  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  webSectionHeader: {
    marginHorizontal: 0,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#152238",
  },

  sectionSubtitle: {
    fontSize: 11,
    color: "#8A95A5",
    marginTop: 1,
  },

  countBadge: {
    minWidth: 35,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#E7F0FF",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#1769E0",
    fontSize: 13,
    fontWeight: "800",
  },

  apartmentGrid: {
    marginHorizontal: 20,
  },

  webGrid: {
    marginHorizontal: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E8EDF4",
  },

  webCard: {
    flex: 1,
    minWidth: 0,
    marginBottom: 0,
  },

  imageContainer: {
    height: 200,
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E8EDF4",
  },

  statusBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  availableBadge: {
    backgroundColor: "#FFFFFF",
  },

  unavailableBadge: {
    backgroundColor: "#FFFFFF",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    marginRight: 5,
  },

  greenDot: {
    backgroundColor: "#22C55E",
  },

  redDot: {
    backgroundColor: "#EF4444",
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },

  cardContent: {
    padding: 13,
  },

  apartmentTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#152238",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  location: {
    flex: 1,
    fontSize: 11,
    color: "#7A8798",
    marginLeft: 5,
  },

  features: {
    flexDirection: "row",
    marginTop: 10,
    gap: 11,
  },

  feature: {
    flexDirection: "row",
    alignItems: "center",
  },

  featureText: {
    fontSize: 10,
    color: "#667085",
    marginLeft: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF0F4",
    marginVertical: 10,
  },

  rateTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#667085",
    marginBottom: 6,
  },

  rates: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rateRight: {
    alignItems: "flex-end",
  },

  rateLabel: {
    fontSize: 9,
    color: "#98A2B3",
    marginBottom: 1,
  },

  rate: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1769E0",
  },

  rateUnit: {
    fontSize: 8,
    fontWeight: "500",
    color: "#7A8798",
  },

  viewButton: {
    height: 40,
    borderRadius: 11,
    backgroundColor: "#1769E0",
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  viewUnavailableButton: {
    backgroundColor: "#1769E0",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  loading: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 9,
    fontSize: 12,
    color: "#7A8798",
  },

  empty: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 35,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#152238",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 12,
    color: "#8A95A5",
    marginTop: 4,
  },
});