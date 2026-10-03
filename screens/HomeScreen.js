import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

export default function HomeScreen({ navigation }) {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadApartments = async () => {
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .eq("status", "Available")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Apartment error:", error.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setApartments(data || []);
    setLoading(false);
    setRefreshing(false);
  };

  React.useEffect(() => {
    loadApartments();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadApartments();
  }, []);

  const renderApartment = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("ApartmentDetails", {
            apartment: item,
          })
        }
      >
        {/* APARTMENT IMAGE */}
        <View style={styles.imageWrapper}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.apartmentImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather
                name="home"
                size={42}
                color="#2563EB"
              />
            </View>
          )}

          {/* IMAGE OVERLAY */}
          <View style={styles.imageOverlay} />

          {/* AVAILABLE BADGE */}
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />

            <Text style={styles.availableText}>
              Available
            </Text>
          </View>

          {/* PRICE ON IMAGE */}
          <View style={styles.imagePrice}>
            <Text style={styles.imagePriceText}>
              ₱{Number(item.price).toLocaleString()}
            </Text>

            <Text style={styles.imagePriceMonth}>
              /mo
            </Text>
          </View>
        </View>

        {/* APARTMENT INFORMATION */}
        <View style={styles.cardContent}>
          <Text
            style={styles.apartmentTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* LOCATION */}
          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              size={14}
              color="#2563EB"
            />

            <Text
              style={styles.locationText}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>

          {/* FEATURES */}
          <View style={styles.featuresRow}>
            <View style={styles.featureChip}>
              <Feather
                name="home"
                size={14}
                color="#2563EB"
              />

              <Text style={styles.featureText}>
                {item.bedrooms}{" "}
                {item.bedrooms === 1
                  ? "Bedroom"
                  : "Bedrooms"}
              </Text>
            </View>

            <View style={styles.featureChip}>
              <Feather
                name="droplet"
                size={14}
                color="#2563EB"
              />

              <Text style={styles.featureText}>
                {item.bathrooms}{" "}
                {item.bathrooms === 1
                  ? "Bath"
                  : "Baths"}
              </Text>
            </View>
          </View>

          {/* CARD BOTTOM */}
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.monthlyLabel}>
                Monthly rent
              </Text>

              <Text style={styles.cardPrice}>
                ₱{Number(item.price).toLocaleString()}
              </Text>
            </View>

            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>
                View
              </Text>

              <Feather
                name="arrow-up-right"
                size={17}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* LOADING SCREEN */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.loadingLogo}>
          <Feather
            name="home"
            size={34}
            color="#FFFFFF"
          />
        </View>

        <ActivityIndicator
          size="small"
          color="#2563EB"
          style={styles.loader}
        />

        <Text style={styles.loadingTitle}>
          Finding your next home
        </Text>

        <Text style={styles.loadingSubtitle}>
          Loading available apartments...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9FC"
      />

      <FlatList
        data={apartments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderApartment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        ListHeaderComponent={
          <View>
            {/* HEADER */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  GOOD DAY 👋
                </Text>

                <Text style={styles.headerTitle}>
                  Find your next home
                </Text>
              </View>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() =>
                  navigation.navigate("Profile")
                }
                activeOpacity={0.8}
              >
                <Feather
                  name="user"
                  size={21}
                  color="#172033"
                />
              </TouchableOpacity>
            </View>

            {/* HERO CARD */}
            <View style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View style={styles.heroIcon}>
                  <Feather
                    name="home"
                    size={21}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.heroTitle}>
                  Comfortable living,
                  {"\n"}
                  made simple.
                </Text>

                <Text style={styles.heroSubtitle}>
                  Discover apartments that fit
                  your lifestyle and budget.
                </Text>
              </View>

              <View style={styles.heroDecorationOne} />

              <View style={styles.heroDecorationTwo} />

              <Feather
                name="home"
                size={100}
                color="rgba(255,255,255,0.08)"
                style={styles.heroHomeIcon}
              />
            </View>

            {/* APARTMENT SECTION */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Available Apartments
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Choose a place that feels like home
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {apartments.length}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather
                name="home"
                size={40}
                color="#2563EB"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No apartments available
            </Text>

            <Text style={styles.emptyText}>
              There are currently no apartments
              available for rent.
            </Text>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadApartments}
              activeOpacity={0.85}
            >
              <Feather
                name="refresh-cw"
                size={16}
                color="#FFFFFF"
              />

              <Text style={styles.refreshButtonText}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  greeting: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#172033",
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E9F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  /* HERO */

  heroCard: {
    height: 190,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    marginBottom: 28,
  },

  heroContent: {
    padding: 21,
    width: "78%",
    zIndex: 2,
  },

  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
  },

  heroSubtitle: {
    color: "#DDE9FF",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  heroHomeIcon: {
    position: "absolute",
    right: -12,
    bottom: -15,
  },

  heroDecorationOne: {
    position: "absolute",
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: "rgba(255,255,255,0.05)",
    right: 15,
    top: -45,
  },

  heroDecorationTwo: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.04)",
    right: 85,
    bottom: -35,
  },

  /* APARTMENT SECTION */

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#8A92A3",
    marginTop: 4,
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  countText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "800",
  },

  /* APARTMENT CARD */

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8EBF0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,
  },

  imageWrapper: {
    height: 215,
    backgroundColor: "#EAF1FF",
    position: "relative",
  },

  apartmentImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.14)",
  },

  availableBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  availableText: {
    color: "#172033",
    fontSize: 11,
    fontWeight: "800",
  },

  imagePrice: {
    position: "absolute",
    bottom: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "baseline",
  },

  imagePriceText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  imagePriceMonth: {
    color: "#F0F4FF",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 3,
  },

  cardContent: {
    padding: 17,
  },

  apartmentTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 7,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  locationText: {
    flex: 1,
    color: "#7B8494",
    fontSize: 13,
    marginLeft: 6,
  },

  featuresRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FC",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginRight: 8,
  },

  featureText: {
    color: "#4B5563",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 5,
  },

  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: "#EEF0F3",
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  monthlyLabel: {
    color: "#8A92A3",
    fontSize: 10,
    marginBottom: 3,
  },

  cardPrice: {
    color: "#2563EB",
    fontSize: 20,
    fontWeight: "800",
  },

  viewButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginRight: 5,
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingLogo: {
    width: 75,
    height: 75,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  loader: {
    marginBottom: 14,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 5,
  },

  loadingSubtitle: {
    color: "#8A92A3",
    fontSize: 13,
  },

  /* EMPTY */

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 8,
  },

  emptyText: {
    color: "#8A92A3",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  refreshButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },
});