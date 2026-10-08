import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

export default function ApartmentDetailsScreen({ route, navigation }) {
  const { apartment: routeApartment } = route.params;
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const [apartment, setApartment] = useState(routeApartment);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(
    routeApartment.image_url
  );

  const isAvailable = apartment?.status === "Available";

  useEffect(() => {
    loadApartment();
    loadImages();
  }, []);

  const loadApartment = async () => {
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .eq("id", routeApartment.id)
      .single();

    if (!error && data) {
      setApartment(data);

      if (!selectedImage && data.image_url) {
        setSelectedImage(data.image_url);
      }
    }
  };

  const loadImages = async () => {
    const { data, error } = await supabase
      .from("apartment_images")
      .select("*")
      .eq("apartment_id", routeApartment.id)
      .order("image_order", { ascending: true });

    if (!error && data?.length) {
      setImages(data);
      setSelectedImage(data[0].image_url);
    } else {
      setImages([
        {
          id: 1,
          image_url: routeApartment.image_url,
        },
      ]);
    }
  };

  const dailyRate =
    apartment.daily_rate || Number(apartment.price) / 30;

  const monthlyRate =
    apartment.price || Number(dailyRate) * 30;

  const formatPrice = (price) =>
    `₱${Number(price).toLocaleString("en-PH")}`;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.page}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather
                name="arrow-left"
                size={22}
                color="#17243A"
              />
            </TouchableOpacity>

            <Text style={styles.pageTitle}>
              Apartment Details
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <View
            style={[
              styles.mainLayout,
              isWeb && styles.mainLayoutWeb,
            ]}
          >
            <View
              style={[
                styles.leftColumn,
                isWeb && styles.leftColumnWeb,
              ]}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.mainImage}
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

                  <Text style={styles.statusText}>
                    {isAvailable ? "Available" : "Unavailable"}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              >
                {images.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || index}
                    onPress={() =>
                      setSelectedImage(item.image_url)
                    }
                    style={[
                      styles.thumbnailWrapper,
                      selectedImage === item.image_url &&
                        styles.thumbnailSelected,
                    ]}
                  >
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View
              style={[
                styles.rightColumn,
                isWeb && styles.rightColumnWeb,
              ]}
            >
              <Text style={styles.apartmentTitle}>
                {apartment.title}
              </Text>

              <View style={styles.locationRow}>
                <Feather
                  name="map-pin"
                  size={17}
                  color="#1769E0"
                />

                <Text style={styles.locationText}>
                  {apartment.location}
                </Text>
              </View>

              <View style={styles.featuresCard}>
                {[
                  [
                    "bed",
                    apartment.bedrooms || 1,
                    "Bedroom",
                  ],
                  [
                    "shower",
                    apartment.bathrooms || 1,
                    "Bathroom",
                  ],
                ].map(([icon, value, label], index) => (
                  <React.Fragment key={label}>
                    {index > 0 && (
                      <View style={styles.featureDivider} />
                    )}

                    <View style={styles.feature}>
                      <View style={styles.featureIcon}>
                        <MaterialCommunityIcons
                          name={icon}
                          size={21}
                          color="#1769E0"
                        />
                      </View>

                      <Text style={styles.featureNumber}>
                        {value}
                      </Text>

                      <Text style={styles.featureLabel}>
                        {label}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}

                <View style={styles.featureDivider} />

                <View style={styles.feature}>
                  <View style={styles.featureIcon}>
                    <Feather
                      name="wifi"
                      size={20}
                      color="#1769E0"
                    />
                  </View>

                  <Text style={styles.featureNumber}>
                    24/7
                  </Text>

                  <Text style={styles.featureLabel}>
                    Access
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>
                Rental Rates
              </Text>

              <View style={styles.ratesRow}>
                {[
                  ["Daily Rental", dailyRate, "/day"],
                  [
                    "Monthly Rental",
                    monthlyRate,
                    "/month",
                  ],
                ].map(([label, price, period]) => (
                  <View style={styles.rateCard} key={label}>
                    <View style={styles.rateIcon}>
                      <Feather
                        name="calendar"
                        size={19}
                        color="#1769E0"
                      />
                    </View>

                    <Text style={styles.rateLabel}>
                      {label}
                    </Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.price}>
                        {formatPrice(price)}
                      </Text>

                      <Text style={styles.period}>
                        {period}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>
                About this apartment
              </Text>

              <Text style={styles.description}>
                {apartment.description ||
                  "Spacious apartment with a comfortable living area."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.startingText}>
            Starting from
          </Text>

          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>
              {formatPrice(dailyRate)}
            </Text>

            <Text style={styles.bottomPeriod}>
              /day
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            !isAvailable && styles.disabledBookButton,
          ]}
          onPress={() => {
            if (isAvailable) {
              navigation.navigate("Booking", {
                apartment,
              });
            }
          }}
          disabled={!isAvailable}
          activeOpacity={isAvailable ? 0.85 : 1}
        >
          <Text
            style={[
              styles.bookButtonText,
              !isAvailable &&
                styles.disabledBookButtonText,
            ]}
          >
            {isAvailable
              ? "Book Apartment"
              : "Apartment Unavailable"}
          </Text>

          {isAvailable && (
            <Feather
              name="arrow-right"
              size={20}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  page: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  topBar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F2",
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#17243A",
  },

  headerSpacer: {
    width: 44,
  },

  mainLayout: {
    width: "100%",
  },

  mainLayoutWeb: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
  },

  leftColumn: {
    width: "100%",
  },

  leftColumnWeb: {
    flex: 1.45,
    maxWidth: 680,
  },

  imageContainer: {
    width: "100%",
    height: 365,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#E8EDF5",
    position: "relative",
  },

  mainImage: {
    width: "100%",
    height: "100%",
  },

  statusBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    height: 39,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  availableBadge: {
    backgroundColor: "#FFFFFF",
  },

  unavailableBadge: {
    backgroundColor: "#FFFFFF",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  greenDot: {
    backgroundColor: "#20B86B",
  },

  redDot: {
    backgroundColor: "#E5484D",
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#243047",
  },

  thumbnailList: {
    paddingTop: 10,
    paddingBottom: 2,
    gap: 9,
  },

  thumbnailWrapper: {
    width: 82,
    height: 63,
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },

  thumbnailSelected: {
    borderColor: "#1769E0",
  },

  thumbnail: {
    width: "100%",
    height: "100%",
  },

  rightColumn: {
    width: "100%",
    marginTop: 22,
  },

  rightColumnWeb: {
    flex: 1,
    marginTop: 0,
    maxWidth: 480,
  },

  apartmentTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#17243A",
    marginBottom: 5,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 13,
  },

  locationText: {
    fontSize: 14,
    color: "#7D899D",
  },

  featuresCard: {
    height: 108,
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    marginBottom: 17,
  },

  feature: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  featureDivider: {
    width: 1,
    height: 63,
    backgroundColor: "#E9EDF3",
  },

  featureIcon: {
    width: 41,
    height: 41,
    borderRadius: 12,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  featureNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17243A",
  },

  featureLabel: {
    fontSize: 11,
    color: "#8A96AA",
    marginTop: 1,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#17243A",
    marginBottom: 9,
  },

  ratesRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 19,
  },

  rateCard: {
    flex: 1,
    minHeight: 122,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    padding: 13,
  },

  rateIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  rateLabel: {
    fontSize: 12,
    color: "#8A96AA",
    marginBottom: 3,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1769E0",
  },

  period: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8190A6",
    marginLeft: 3,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: "#718097",
    marginBottom: 18,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 50,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E1E6EE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  startingText: {
    fontSize: 12,
    color: "#8A96AA",
    marginBottom: 1,
  },

  bottomPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  bottomPrice: {
    fontSize: 25,
    fontWeight: "800",
    color: "#1769E0",
  },

  bottomPeriod: {
    fontSize: 12,
    color: "#7D899D",
    fontWeight: "600",
    marginLeft: 4,
  },

  bookButton: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 15,
    backgroundColor: "#1769E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  disabledBookButton: {
    backgroundColor: "#D5DAE2",
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  disabledBookButtonText: {
    color: "#7D8796",
  },
});