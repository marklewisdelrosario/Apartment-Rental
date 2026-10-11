import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ApartmentDetailsScreen from "./screens/ApartmentDetailsScreen";
import BookingScreen from "./screens/BookingScreen";
import PaymentScreen from "./screens/PaymentScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ["http://localhost:8081"],
  config: {
    screens: {
      Login: "",
      Register: "register",
      Home: "home",
      ApartmentDetails: "apartment-details",
      Booking: "booking",
      Payment: "payment",
      Profile: "profile",
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ApartmentDetails" component={ApartmentDetailsScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}