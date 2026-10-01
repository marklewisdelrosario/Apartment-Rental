import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

import { supabase } from "../services/supabase";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("09");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Phone must be exactly 11 digits and start with 09
    const phoneRegex = /^09[0-9]{9}$/;

    if (!phoneRegex.test(phone)) {
      Alert.alert(
        "Invalid Phone Number",
        "Phone number must be exactly 11 digits and start with 09.\n\nExample: 09123456789"
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address.\n\nExample: example@gmail.com"
      );
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
        },
      },
    });

    if (error) {
      console.log("REGISTER ERROR:", error);
      Alert.alert("Registration Failed", error.message);
      return;
    }

    Alert.alert(
      "Account Created",
      "Your account has been created successfully."
    );

    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>🏠</Text>

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Create your apartment rental account
        </Text>

        {/* Full Name */}
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        {/* Phone Number */}
        <TextInput
          style={styles.input}
          placeholder="09XXXXXXXXX"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={(text) => {
            const numbersOnly = text.replace(/[^0-9]/g, "");

            if (!numbersOnly.startsWith("09")) {
              setPhone("09");
              return;
            }

            setPhone(numbersOnly.slice(0, 11));
          }}
          keyboardType="phone-pad"
          maxLength={11}
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eye}>
              {showPassword ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },

  logo: {
    fontSize: 60,
    textAlign: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#222",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: "#222",
  },

  eyeButton: {
    padding: 12,
  },

  eye: {
    fontSize: 20,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  loginText: {
    textAlign: "center",
    color: "#2563EB",
    marginTop: 20,
    fontSize: 15,
  },
});