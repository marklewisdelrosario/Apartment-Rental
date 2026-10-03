import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../services/supabase";

const { width } = Dimensions.get("window");

export default function ApartmentDetailsScreen({ route, navigation }) {
  const { apartment } = route.params;

  const insets = useSafeAreaInsets();

  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const { data, error } = await supabase
      .from("apartment_images")
      .select("*")
      .eq("apartment_id", apartment.id)
      .order("image_order", { ascending: true });

    if (error) {
      console.log("Image error:", error.message);

      if (apartment.image_url) {
        setImages([
          {
            id: "main",
            image_url: apartment.image_url,
            image_order: 1,
          },
        ]);
      }

      setLoadingImages(false);
      return;
    }

    if (data && data.length > 0) {
      setImages(data);
    } else if (apartment.image_url) {
      setImages([
        {
          id: "main",
          image_url: apartment.image_url,
          image_order: 1,
        },
      ]);
    }

    setLoadingImages(false);
  };

  const handleImageScroll = (event) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / width
    );

    setCurrentImage(slide);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9FC"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* IMAGE GALLERY */}
        <View style={styles.galleryContainer}>
          {loadingImages ? (
            <View style={styles.imageLoading}>
              <ActivityIndicator
                size="large"
                color="#2563EB"
              />

              <Text style={styles.loadingText}>
                Loading apartment photos...
              </Text>
            </View>
          ) : images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleImageScroll}
              >
                {images.map((image) => (
                  <Image
                    key={image.id.toString()}
                    source={{ uri: image.image_url }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              {/* IMAGE COUNTER */}
              <View style={styles.imageCounter}>
                <Feather
                  name="camera"
                  size={14}
                  color="#FFFFFF"
                />

                <Text style={styles.imageCounterText}>
                  {currentImage + 1} / {images.length}
                </Text>
              </View>

              {/* DOT INDICATORS */}
              <View style={styles.dotsContainer}>
                {images.map((image, index) => (
                  <View
                    key={image.id.toString()}
                    style={[
                      styles.dot,
                      index === currentImage &&
                        styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Feather
                name="home"
                size={55}
                color="#2563EB"
              />

              <Text style={styles.noImageText}>
                No apartment photos
              </Text>
            </View>
          )}

          {/* BACK BUTTON */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Feather
              name="arrow-left"
              size={22}
              color="#222"
            />
          </TouchableOpacity>
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.content}>
          {/* TITLE */}
          <View style={styles.titleSection}>
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>
                {apartment.title}
              </Text>

              <View style={styles.locationRow}>
                <Feather
                  name="map-pin"
                  size={16}
                  color="#2563EB"
                />

                <Text style={styles.location}>
                  {apartment.location}
                </Text>
              </View>
            </View>

            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />

              <Text style={styles.availableText}>
                Available
              </Text>
            </View>
          </View>

          {/* PRICE */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>
                Monthly Rent
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.currency}>
                  ₱
                </Text>

                <Text style={styles.price}>
                  {Number(apartment.price).toLocaleString()}
                </Text>

                <Text style={styles.month}>
                  / month
                </Text>
              </View>
            </View>

            <View style={styles.priceIcon}>
              <Feather
                name="credit-card"
                size={23}
                color="#2563EB"
              />
            </View>
          </View>

          {/* PROPERTY FEATURES */}
          <Text style={styles.sectionTitle}>
            Property Details
          </Text>

          <View style={styles.featuresCard}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather
                  name="home"
                  size={20}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.featureValue}>
                {apartment.bedrooms}
              </Text>

              <Text style={styles.featureLabel}>
                Bedroom
                {apartment.bedrooms !== 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather
                  name="droplet"
                  size={20}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.featureValue}>
                {apartment.bathrooms}
              </Text>

              <Text style={styles.featureLabel}>
                Bathroom
                {apartment.bathrooms !== 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Feather
                  name="check-circle"
                  size={20}
                  color="#16A34A"
                />
              </View>

              <Text style={styles.featureValue}>
                Ready
              </Text>

              <Text style={styles.featureLabel}>
                To Move In
              </Text>
            </View>
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.sectionTitle}>
            About This Apartment
          </Text>

          <View style={styles.descriptionCard}>
            <Text style={styles.description}>
              {apartment.description ||
                "A comfortable and well-maintained apartment suitable for tenants looking for a convenient place to live."}
            </Text>
          </View>

          {/* LOCATION */}
          <Text style={styles.sectionTitle}>
            Location
          </Text>

          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Feather
                name="map-pin"
                size={23}
                color="#2563EB"
              />
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>
                Apartment Location
              </Text>

              <Text style={styles.locationValue}>
                {apartment.location}
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color="#999"
            />
          </View>

          {/* SPACE FOR FIXED BOOKING BAR */}
          <View
            style={{
              height: 115 + insets.bottom,
            }}
          />
        </View>
      </ScrollView>

      {/* BOTTOM BOOKING BAR */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom + 10, 18),
          },
        ]}
      >
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>
            Monthly Rent
          </Text>

          <Text style={styles.bottomPriceValue}>
            ₱{Number(apartment.price).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("Booking", {
              apartment,
            })
          }
        >
          <Text style={styles.bookButtonText}>
            Book Apartment
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
    paddingBottom: 20,
  },

  /* =========================
     IMAGE GALLERY
  ========================= */

  galleryContainer: {
    width: "100%",
    height: 290,
    backgroundColor: "#E5E7EB",
    position: "relative",
  },

  galleryImage: {
    width: width,
    height: 290,
  },

  imageLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 13,
  },

  noImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  noImageText: {
    marginTop: 10,
    color: "#777",
    fontSize: 14,
  },

  backButton: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  imageCounter: {
    position: "absolute",
    right: 18,
    top: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  dotsContainer: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.55)",
  },

  activeDot: {
    width: 22,
    backgroundColor: "#FFFFFF",
  },

  /* =========================
     MAIN CONTENT
  ========================= */

  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  titleTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#172033",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  location: {
    marginLeft: 6,
    color: "#6B7280",
    fontSize: 14,
  },

  availableBadge: {
    backgroundColor: "#EAF8EF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },

  availableText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "700",
  },

  /* =========================
     PRICE
  ========================= */

  priceCard: {
    marginTop: 20,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  priceLabel: {
    color: "#8A92A3",
    fontSize: 12,
    fontWeight: "600",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 3,
  },

  currency: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },

  price: {
    fontSize: 25,
    fontWeight: "800",
    color: "#172033",
    marginLeft: 2,
  },

  month: {
    color: "#8A92A3",
    fontSize: 12,
    marginLeft: 5,
  },

  priceIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* =========================
     SECTION TITLES
  ========================= */

  sectionTitle: {
    marginTop: 24,
    marginBottom: 11,
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
  },

  /* =========================
     PROPERTY FEATURES
  ========================= */

  featuresCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  feature: {
    flex: 1,
    alignItems: "center",
  },

  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  featureValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#172033",
  },

  featureLabel: {
    marginTop: 2,
    color: "#8A92A3",
    fontSize: 10,
    textAlign: "center",
  },

  featureDivider: {
    width: 1,
    height: 55,
    backgroundColor: "#E5E7EB",
  },

  /* =========================
     DESCRIPTION
  ========================= */

  descriptionCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    elevation: 2,
  },

  description: {
    color: "#606978",
    fontSize: 14,
    lineHeight: 22,
  },

  /* =========================
     LOCATION
  ========================= */

  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  locationInfo: {
    flex: 1,
    marginLeft: 13,
  },

  locationTitle: {
    fontSize: 12,
    color: "#8A92A3",
    marginBottom: 3,
  },

  locationValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172033",
  },

  /* =========================
     FIXED BOOKING BAR
  ========================= */

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 18,
    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor: "#E8EBF0",

    flexDirection: "row",
    alignItems: "center",

    elevation: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    zIndex: 100,
  },

  bottomPrice: {
    flex: 1,
  },

  bottomPriceLabel: {
    color: "#8A92A3",
    fontSize: 10,
  },

  bottomPriceValue: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },

  bookButton: {
    backgroundColor: "#2563EB",
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});