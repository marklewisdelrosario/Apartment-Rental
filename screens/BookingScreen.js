import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export default function BookingScreen({ route, navigation }) {
  const { apartment } = route.params;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [rentalType, setRentalType] = useState("Monthly");
  const [duration, setDuration] = useState(1);
  const [startDate, setStartDate] = useState(new Date());

  const dailyRate = Number(apartment.daily_rate || 0);
  const monthlyRate = Number(apartment.price || dailyRate * 30);
  const plans = [1, 3, 6, 12];

  const endDate = useMemo(() => {
    const date = new Date(startDate);

    if (rentalType === "Daily") {
      date.setDate(date.getDate() + duration);
    } else {
      date.setMonth(date.getMonth() + duration);
    }

    return date;
  }, [startDate, duration, rentalType]);

  const totalAmount =
    rentalType === "Daily"
      ? dailyRate * duration
      : monthlyRate * duration;

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatInputDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const handleDateChange = (event) => {
    const value = event.target.value;
    if (!value) return;

    const [year, month, day] = value.split("-").map(Number);
    setStartDate(new Date(year, month - 1, day));
  };

  const handleContinue = () =>
    navigation.navigate("Payment", {
      apartment,
      rentalType,
      duration,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalAmount,
    });

  const durationText = rentalType === "Daily"
    ? `${duration} ${duration === 1 ? "Day" : "Days"}`
    : `${duration} ${duration === 1 ? "Month" : "Months"}`;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopContent]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={22} color="#172033" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Your Stay</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.content, isDesktop && styles.desktopLayout]}>
          <View style={styles.mainColumn}>
            <Text style={styles.sectionTitle}>Rental Type</Text>

            <View style={styles.typeContainer}>
              {["Daily", "Monthly"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    rentalType === type && styles.activeType,
                  ]}
                  onPress={() => {
                    setRentalType(type);
                    setDuration(1);
                  }}
                >
                  <Text
                    style={[
                      styles.typeText,
                      rentalType === type && styles.activeTypeText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Rental Period</Text>

            {rentalType === "Daily" ? (
              <View style={styles.durationCard}>
                <View>
                  <Text style={styles.durationLabel}>NUMBER OF DAYS</Text>
                  <Text style={styles.durationValue}>{durationText}</Text>
                </View>

                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepButton}
                    onPress={() => setDuration(Math.max(1, duration - 1))}
                  >
                    <Text style={styles.stepText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{duration}</Text>
                  <TouchableOpacity
                    style={styles.stepButton}
                    onPress={() => setDuration(duration + 1)}
                  >
                    <Text style={styles.stepText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.planGrid}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan}
                    style={[
                      styles.planCard,
                      duration === plan && styles.activePlan,
                    ]}
                    onPress={() => setDuration(plan)}
                  >
                    <Text
                      style={[
                        styles.planNumber,
                        duration === plan && styles.activePlanText,
                      ]}
                    >
                      {plan}
                    </Text>
                    <Text
                      style={[
                        styles.planText,
                        duration === plan && styles.activePlanText,
                      ]}
                    >
                      {plan === 1 ? "Month" : "Months"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Rental Dates</Text>

            <View style={styles.dateCard}>
              <View style={styles.webDateRow}>
                <View style={styles.dateIcon}>
                  <Feather name="calendar" size={19} color="#2563EB" />
                </View>

                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>MOVE-IN / START DATE</Text>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                </View>

                <input
                  type="date"
                  value={formatInputDate(startDate)}
                  min={formatInputDate(new Date())}
                  onChange={handleDateChange}
                  style={styles.hiddenDateInput}
                />
              </View>

              <View style={styles.dateDivider} />

              <View style={styles.dateRow}>
                <View style={styles.dateIconEnd}>
                  <Feather name="flag" size={18} color="#2563EB" />
                </View>

                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>END DATE</Text>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.summaryColumn}>
            <View style={styles.selectedApartment}>
              <View style={styles.selectedImageWrapper}>
                <img
                  src={apartment.image_url}
                  alt={apartment.title}
                  style={styles.selectedImage}
                />
              </View>

              <View style={styles.selectedInfo}>
                <Text style={styles.selectedLabel}>
                  SELECTED APARTMENT
                </Text>
                <Text style={styles.selectedTitle}>{apartment.title}</Text>
                <View style={styles.selectedLocation}>
                  <Feather name="map-pin" size={13} color="#6B7280" />
                  <Text style={styles.selectedLocationText}>
                    {apartment.location}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>

              {[
                ["Rental Type", rentalType],
                ["Duration", durationText],
                ["Move-in", formatDate(startDate)],
                ["End Date", formatDate(endDate)],
              ].map(([label, value]) => (
                <View style={styles.summaryRow} key={label}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <Text style={styles.summaryValue}>{value}</Text>
                </View>
              ))}

              <View style={styles.summaryDivider} />
              <Text style={styles.totalLabel}>TOTAL RENT</Text>
              <Text style={styles.totalAmount}>
                ₱{totalAmount.toLocaleString()}
              </Text>

              <TouchableOpacity
                style={styles.paymentButton}
                onPress={handleContinue}
              >
                <Text style={styles.paymentButtonText}>
                  Continue to Payment
                </Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  desktopContent: {
    maxWidth: 1250,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    height: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
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
  headerTitle: {
    color: "#172033",
    fontSize: 20,
    fontWeight: "900",
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    padding: 20,
  },
  desktopLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
  },
  mainColumn: {
    flex: 1,
  },
  sectionTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 4,
  },
  typeContainer: {
    flexDirection: "row",
    backgroundColor: "#EAF1FF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 11,
  },
  activeType: {
    backgroundColor: "#2563EB",
  },
  typeText: {
    color: "#526075",
    fontSize: 14,
    fontWeight: "800",
  },
  activeTypeText: {
    color: "#fff",
  },
  durationCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  durationLabel: {
    color: "#8A92A3",
    fontSize: 9,
    fontWeight: "900",
  },
  durationValue: {
    color: "#172033",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 5,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#2563EB",
    fontSize: 22,
    fontWeight: "700",
  },
  stepValue: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
  },
  planGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    minHeight: 78,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  activePlan: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  planNumber: {
    color: "#172033",
    fontSize: 19,
    fontWeight: "900",
  },
  planText: {
    color: "#7B8495",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  activePlanText: {
    color: "#fff",
  },
  dateCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  webDateRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    cursor: "pointer",
  },
  hiddenDateInput: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
    zIndex: 10,
  },
  dateIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateIconEnd: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    color: "#8A92A3",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  dateValue: {
    color: "#172033",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
  },
  dateDivider: {
    height: 1,
    backgroundColor: "#E9EDF3",
    marginVertical: 16,
  },
  summaryColumn: {
    width: "100%",
    maxWidth: 370,
  },
  selectedApartment: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  selectedImageWrapper: {
    width: 72,
    height: 68,
    borderRadius: 13,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  selectedInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  selectedLabel: {
    color: "#8A92A3",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  selectedTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },
  selectedLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  selectedLocationText: {
    color: "#6B7280",
    fontSize: 11,
    marginLeft: 4,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },
  summaryTitle: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  summaryLabel: {
    color: "#7A8495",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryValue: {
    color: "#172033",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E9EDF3",
    marginVertical: 7,
  },
  totalLabel: {
    color: "#8A92A3",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginTop: 12,
  },
  totalAmount: {
    color: "#2563EB",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
    marginBottom: 20,
  },
  paymentButton: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});