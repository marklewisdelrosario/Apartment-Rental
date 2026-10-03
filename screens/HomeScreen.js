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
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("ApartmentDetails", {
            apartment: item,
          })
        }
      >
        {/* Apartment Image */}
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.apartmentImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.houseCircle}>
              <Feather name="home" size={38} color="#2563EB" />
            </View>
          )}

          {/* Available Badge */}
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />
            <Text style={styles.availableText}>Available</Text>
          </View>
        </View>

        {/* Apartment Information */}
        <View style={styles.cardContent}>
          <Text style={styles.apartmentTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.locationRow}>
            <Feather name="map-pin" size={15} color="#777" />

            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Feather name="home" size={15} color="#555" />

              <Text style={styles.detailText}>
                {item.bedrooms} Bedroom
                {item.bedrooms !== 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Feather name="droplet" size={15} color="#555" />

              <Text style={styles.detailText}>
                {item.bathrooms} Bathroom
                {item.bathrooms !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.priceLabel}>Monthly Rent</Text>

              <Text style={styles.price}>
                ₱{Number(item.price).toLocaleString()}
              </Text>
            </View>

            <View style={styles.arrowButton}>
              <Feather
                name="arrow-right"
                size={19}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.loadingIcon}>
          <Feather name="home" size={38} color="#2563EB" />
        </View>

        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={styles.loader}
        />

        <Text style={styles.loadingTitle}>
          Finding apartments...
        </Text>

        <Text style={styles.loadingSubtitle}>
          Please wait while we load available apartments.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

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
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.smallGreeting}>
                  WELCOME BACK
                </Text>

                <Text style={styles.headerTitle}>
                  Find Your Next Home
                </Text>
              </View>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate("Profile")}
                activeOpacity={0.8}
              >
                <Feather
                  name="user"
                  size={21}
                  color="#2563EB"
                />
              </TouchableOpacity>
            </View>

            {/* Intro Card */}
            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <Feather
                  name="home"
                  size={25}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.introTextContainer}>
                <Text style={styles.introTitle}>
                  Your next apartment is here
                </Text>

                <Text style={styles.introSubtitle}>
                  Browse comfortable homes available for rent.
                </Text>
              </View>
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Available Apartments
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {apartments.length} apartment
                  {apartments.length !== 1 ? "s" : ""} available
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
                color="#999"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No apartments available
            </Text>

            <Text style={styles.emptyText}>
              There are currently no available apartments.
              Please check again later.
            </Text>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadApartments}
            >
              <Feather
                name="refresh-cw"
                size={17}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  smallGreeting: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    letterSpacing: 1,
    marginBottom: 5,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#1F2937",
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D7E4FF",
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  introSubtitle: {
    color: "#DCE8FF",
    fontSize: 13,
    lineHeight: 19,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 19,
    backgroundColor: "#EAF1FF",
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8EBF0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  imageContainer: {
    height: 190,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  apartmentImage: {
    width: "100%",
    height: "100%",
  },

  houseCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  availableBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  availableText: {
    color: "#333",
    fontSize: 11,
    fontWeight: "700",
  },

  cardContent: {
    padding: 17,
  },

  apartmentTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  locationText: {
    fontSize: 13,
    color: "#777",
    marginLeft: 6,
    flex: 1,
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },

  detailText: {
    color: "#555",
    fontSize: 13,
    marginLeft: 6,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F1F3",
    paddingTop: 14,
  },

  priceLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 3,
  },

  price: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
  },

  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  loader: {
    marginBottom: 15,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 7,
  },

  loadingSubtitle: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 19,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 55,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EDEFF3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
});