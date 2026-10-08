import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import { supabase } from "../services/supabase";
import { showAlert } from "../services/alert";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const login = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      showAlert(
        "Missing Information",
        "Please enter your email and password."
      );
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      showAlert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        showAlert(
          error.message.toLowerCase().includes("email not confirmed")
            ? "Email Not Verified"
            : "Login Failed",
          error.message.toLowerCase().includes("email not confirmed")
            ? "Please verify your email address before signing in."
            : "Invalid email or password."
        );
        return;
      }

      const user = data?.user;

      if (!user?.email_confirmed_at) {
        await supabase.auth.signOut();
        showAlert(
          "Email Not Verified",
          "Please verify your email address before signing in."
        );
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch {
      showAlert("Error", "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      showAlert(
        "Enter Your Email",
        "Please enter your email address first."
      );
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      showAlert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: window.location.origin,
        }
      );

      if (error) {
        showAlert("Reset Failed", error.message);
        return;
      }

      showAlert(
        "Reset Email Sent",
        "If an account exists with this email, a password reset link has been sent."
      );
    } catch {
      showAlert("Error", "Unable to send the password reset email.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, isWeb && styles.webScroll]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isWeb && styles.webCard]}>
          <View style={styles.logo}>
            <Feather name="home" size={29} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue to your apartment rental account.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color="#8995A6" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor="#A0A9B5"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={forgotPassword}
                disabled={forgotLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>
                  {forgotLoading ? "Sending..." : "Forgot Password?"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color="#8995A6" />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#A0A9B5"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                returnKeyType="done"
                onSubmitEditing={login}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                style={styles.eyeButton}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={19}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            disabled={loading}
            onPress={login}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 25,
    justifyContent: "center",
  },
  webScroll: {
    alignItems: "center",
    paddingVertical: 35,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "#E6EBF2",
  },
  webCard: {
    maxWidth: 460,
    padding: 38,
    boxShadow: "0px 8px 20px rgba(21, 34, 56, 0.06)",
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: "#1769E0",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#152238",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7A8798",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 27,
  },
  field: {
    marginBottom: 17,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#344054",
  },
  forgotText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1769E0",
  },
  inputContainer: {
    height: 53,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    color: "#152238",
    fontSize: 14,
    outlineStyle: "none",
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  eyeButton: {
    width: 28,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#1769E0",
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 23,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8EDF4",
  },
  orText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A0A9B5",
    marginHorizontal: 12,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 13,
    color: "#7A8798",
  },
  registerLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1769E0",
    marginLeft: 5,
  },
});