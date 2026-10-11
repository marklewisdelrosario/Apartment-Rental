import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { supabase } from "../services/supabase";
import { showAlert } from "../services/alert";

export default function ResetPasswordScreen({ navigation }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    // Listen for Supabase password recovery events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
      }
    });

    const processRecoveryLink = async () => {
      try {
        // This screen is designed for your Expo web app.
        if (typeof window === "undefined") return;

        const url = new URL(window.location.href);
        const params = url.searchParams;
        const hashParams = new URLSearchParams(
          url.hash.replace(/^#/, "")
        );

        const code = params.get("code");
        const tokenHash = params.get("token_hash");
        const recoveryType =
          params.get("type") || hashParams.get("type");

        // Handle an email link containing a token hash.
        if (tokenHash && recoveryType === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (active && !error) {
            setRecoveryReady(true);
          } else if (active && error) {
            showAlert(
              "Invalid or Expired Link",
              "Please request a new password reset email."
            );
          }

          return;
        }

        // Handle a PKCE authorization code from the email link.
        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (!active) return;

          if (!error) {
            setRecoveryReady(true);
            return;
          }

          // Supabase may already have processed the code
          // automatically when initializing the browser client.
          const { data } = await supabase.auth.getSession();

          if (active && data.session) {
            setRecoveryReady(true);
          } else if (active) {
            showAlert(
              "Invalid or Expired Link",
              "Please request a new password reset email and open its latest link."
            );
          }

          return;
        }

        // Handle an implicit-flow recovery link whose session
        // has already been processed by the Supabase client.
        if (recoveryType === "recovery") {
          const { data, error } = await supabase.auth.getSession();

          if (!active || error) return;

          if (data.session) {
            setRecoveryReady(true);
          }
        }
      } catch {
        if (active) {
          showAlert(
            "Recovery Error",
            "Unable to verify the reset link. Please request a new one."
          );
        }
      }
    };

    processRecoveryLink();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      showAlert(
        "Missing Information",
        "Please fill in both password fields."
      );
      return;
    }

    if (password.length < 6) {
      showAlert(
        "Weak Password",
        "Your password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert(
        "Password Mismatch",
        "The passwords do not match."
      );
      return;
    }

    if (!recoveryReady) {
      showAlert(
        "Invalid or Expired Link",
        "Please open a valid password reset link from your email."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        showAlert("Update Failed", error.message);
        return;
      }

      await supabase.auth.signOut();

      showAlert(
        "Password Updated",
        "Your password has been changed. Please log in with your new password."
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch {
      showAlert(
        "Error",
        "Unable to update your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logo}>
          <Feather name="lock" size={28} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Reset Password</Text>

        <Text style={styles.subtitle}>
          Create a new password for your apartment rental account.
        </Text>

       
        <Text style={styles.label}>New Password</Text>

        <View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              placeholderTextColor="#A0A9B5"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => setShowPassword((value) => !value)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={19}
                color="#777777"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.passwordHint}>
            At least 6 characters, with a combination of uppercase, lowercase, and number.
          </Text>
        </View>


        <Text style={styles.label}>Confirm New Password</Text>

        <TextInput
          style={styles.confirmInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter new password"
          placeholderTextColor="#A0A9B5"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleUpdatePassword}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Update Password
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Login")}
          disabled={loading}
        >
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FC",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 28,
    borderWidth: 1,
    borderColor: "#E6EBF2",
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
    fontSize: 27,
    fontWeight: "800",
    color: "#152238",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#7A8798",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 27,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#344054",
    marginBottom: 8,
    marginTop: 14,
  },
  inputContainer: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 13,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#152238",
    outlineStyle: "none",
  },
  eyeButton: {
    width: 35,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmInput: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 13,
    paddingHorizontal: 13,
    color: "#152238",
    outlineStyle: "none",
  },
  button: {
    height: 53,
    borderRadius: 14,
    backgroundColor: "#1769E0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  backButton: {
    alignItems: "center",
    marginTop: 22,
  },
  backText: {
    color: "#1769E0",
    fontSize: 14,
    fontWeight: "700",
  },

  passwordHint: {
    fontSize: 11,
    color: "#8995A6",
    marginTop: 6,
    lineHeight: 16,
  },
});