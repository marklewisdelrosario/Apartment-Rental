import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

export default function BookingScreen({ route, navigation }) {
  const { apartment } = route.params;

  const [startDate, setStartDate] = useState(new Date());
  const [months, setMonths] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const monthlyRent = Number(apartment.price);

  const calculateEndDate = () => {
    const endDate = new Date(startDate);

    endDate.setMonth(endDate.getMonth() + months);

    return endDate;
  };

  const endDate = calculateEndDate();

  const totalRent = monthlyRent * months;

  const formatDate = (date) => {
    return date.toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleBooking = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          "Login Required",
          "Please log in before making a booking."
        );

        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user.id,
            apartment_id: apartment.id,
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            monthly_rent: monthlyRent,
            status: "Pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.log("BOOKING ERROR:", error);

        Alert.alert(
          "Booking Failed",
          error.message
        );

        setLoading(false);
        return;
      }

      Alert.alert(
        "Booking Created",
        "Your apartment booking has been created successfully.",
        [
          {
            text: "Continue to Payment",
            onPress: () =>
              navigation.navigate("Payment", {
                booking: data,
                apartment: apartment,
                months: months,
                totalRent: totalRent,
              }),
          },
        ]
      );
    } catch (error) {
      console.log("Unexpected booking error:", error);

      Alert.alert(
        "Error",
        "Something went wrong while creating your booking."
      );
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={22}
              color="#172033"
            />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              Book Apartment
            </Text>

            <Text style={styles.headerSubtitle}>
              Choose your rental plan
            </Text>
          </View>
        </View>

        {/* APARTMENT CARD */}
        <View style={styles.apartmentCard}>
          <View style={styles.homeIcon}>
            <Feather
              name="home"
              size={24}
              color="#2563EB"
            />
          </View>

          <View style={styles.apartmentInfo}>
            <Text style={styles.apartmentName}>
              {apartment.title}
            </Text>

            <View style={styles.locationRow}>
              <Feather
                name="map-pin"
                size={14}
                color="#7B8494"
              />

              <Text style={styles.location}>
                {apartment.location}
              </Text>
            </View>

            <Text style={styles.monthlyRent}>
              ₱{monthlyRent.toLocaleString()} / month
            </Text>
          </View>
        </View>

        {/* MOVE-IN DATE */}
        <Text style={styles.sectionTitle}>
          Move-in Date
        </Text>

        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <View style={styles.dateIcon}>
            <Feather
              name="calendar"
              size={21}
              color="#2563EB"
            />
          </View>

          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>
              Rental starts
            </Text>

            <Text style={styles.dateValue}>
              {formatDate(startDate)}
            </Text>
          </View>

          <Feather
            name="chevron-right"
            size={20}
            color="#8A92A3"
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={
              Platform.OS === "ios"
                ? "spinner"
                : "default"
            }
            minimumDate={new Date()}
            onChange={handleStartDateChange}
          />
        )}

        {/* RENTAL PLAN */}
        <Text style={styles.sectionTitle}>
          How long do you want to stay?
        </Text>

        <Text style={styles.sectionSubtitle}>
          Select your preferred rental period.
        </Text>

        <View style={styles.planGrid}>
          {[1, 3, 6, 12].map((plan) => {
            const selected = months === plan;

            return (
              <TouchableOpacity
                key={plan}
                style={[
                  styles.planCard,
                  selected && styles.selectedPlan,
                ]}
                onPress={() => setMonths(plan)}
                activeOpacity={0.8}
              >
                {selected && (
                  <View style={styles.checkIcon}>
                    <Feather
                      name="check"
                      size={12}
                      color="#FFFFFF"
                    />
                  </View>
                )}

                <Text
                  style={[
                    styles.planNumber,
                    selected && styles.selectedPlanText,
                  ]}
                >
                  {plan}
                </Text>

                <Text
                  style={[
                    styles.planMonth,
                    selected && styles.selectedPlanText,
                  ]}
                >
                  {plan === 1 ? "Month" : "Months"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* RENTAL SUMMARY */}
        <Text style={styles.sectionTitle}>
          Rental Summary
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Monthly Rent
            </Text>

            <Text style={styles.summaryValue}>
              ₱{monthlyRent.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Rental Plan
            </Text>

            <Text style={styles.summaryValue}>
              {months}{" "}
              {months === 1 ? "Month" : "Months"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Move-in Date
            </Text>

            <Text style={styles.summaryValue}>
              {formatDate(startDate)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Rental Ends
            </Text>

            <Text style={styles.summaryValue}>
              {formatDate(endDate)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>
                Estimated Total Rent
              </Text>

              <Text style={styles.totalSubtext}>
                {months}{" "}
                {months === 1 ? "month" : "months"} × ₱
                {monthlyRent.toLocaleString()}
              </Text>
            </View>

            <Text style={styles.totalValue}>
              ₱{totalRent.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* INFORMATION */}
        <View style={styles.infoCard}>
          <Feather
            name="info"
            size={20}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            Your rental end date is automatically calculated
            based on your selected rental plan.
          </Text>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleBooking}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>
                Confirm Booking
              </Text>

              <Feather
                name="arrow-right"
                size={20}
                color="#FFFFFF"
              />
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#172033",
  },

  headerSubtitle: {
    marginTop: 3,
    color: "#8A92A3",
    fontSize: 13,
  },

  apartmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  homeIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  apartmentInfo: {
    flex: 1,
    marginLeft: 14,
  },

  apartmentName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172033",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  location: {
    marginLeft: 5,
    color: "#7B8494",
    fontSize: 12,
  },

  monthlyRent: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
  },

  sectionSubtitle: {
    color: "#8A92A3",
    fontSize: 13,
    marginBottom: 12,
  },

  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  dateIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  dateInfo: {
    flex: 1,
    marginLeft: 13,
  },

  dateLabel: {
    color: "#8A92A3",
    fontSize: 11,
  },

  dateValue: {
    marginTop: 3,
    color: "#172033",
    fontSize: 15,
    fontWeight: "700",
  },

  planGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  planCard: {
    width: "48%",
    minHeight: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E4E8EF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  selectedPlan: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  planNumber: {
    fontSize: 27,
    fontWeight: "800",
    color: "#172033",
  },

  planMonth: {
    marginTop: 2,
    color: "#8A92A3",
    fontSize: 12,
    fontWeight: "600",
  },

  selectedPlanText: {
    color: "#FFFFFF",
  },

  checkIcon: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    elevation: 2,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  summaryLabel: {
    color: "#7B8494",
    fontSize: 13,
  },

  summaryValue: {
    color: "#172033",
    fontSize: 13,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#E9EDF3",
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  totalLabel: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "800",
  },

  totalSubtext: {
    color: "#8A92A3",
    fontSize: 10,
    marginTop: 3,
  },

  totalValue: {
    color: "#2563EB",
    fontSize: 21,
    fontWeight: "800",
  },

  infoCard: {
    marginTop: 15,
    backgroundColor: "#EFF6FF",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#31527D",
    fontSize: 12,
    lineHeight: 18,
  },

  confirmButton: {
    marginTop: 22,
    height: 55,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  disabledButton: {
    opacity: 0.7,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});