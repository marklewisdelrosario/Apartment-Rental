import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { showAlert } from "../services/alert";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;

const PasswordInput = ({
  value,
  setValue,
  visible,
  setVisible,
  placeholder,
}) => (
  <View style={styles.inputContainer}>
    <Feather name="lock" size={18} color="#8995A6" />

    <TextInput
      style={styles.input}
      value={value}
      onChangeText={setValue}
      placeholder={placeholder}
      placeholderTextColor="#A0A9B5"
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="off"
      textContentType="none"
      importantForAutofill="no"
    />

    <TouchableOpacity
      onPress={() => setVisible(!visible)}
      style={styles.eyeButton}
      activeOpacity={0.7}
    >
      <Feather
        name={visible ? "eye-off" : "eye"}
        size={19}
        color="#777"
      />
    </TouchableOpacity>
  </View>
);

export default function RegisterScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = async () => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirm) {
      showAlert(
        "Missing Information",
        "Please complete all required fields."
      );
      return;
    }

    if (!nameRegex.test(cleanName)) {
      showAlert(
        "Invalid Full Name",
        "Please enter a valid full name."
      );
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      showAlert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      showAlert(
        "Invalid Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirm) {
      showAlert(
        "Password Mismatch",
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.log("SUPABASE REGISTER ERROR:", error);

        showAlert(
          "Registration Failed",
          error.message || "Unable to create your account."
        );

        return;
      }

      console.log("REGISTER SUCCESS:", data);

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      setShowPassword(false);
      setShowConfirm(false);

      showAlert(
        "Account Created",
          "Your account was created. Please check your email and click the confirmation link before signing in."
      );

    } catch (error) {
      console.log("REGISTER ERROR:", error);

      showAlert(
        "Registration Error",
        error.message || "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isWeb && styles.webScroll,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.wrapper, isWeb && styles.webWrapper]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather
                name="arrow-left"
                size={21}
                color="#152238"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.brand}>
            <View style={styles.logo}>
              <Feather
                name="home"
                size={27}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.brandName}>
              Create Account
            </Text>

            <Text style={styles.brandSubtitle}>
              Create your apartment rental account
            </Text>
          </View>

          <View style={[styles.card, isWeb && styles.webCard]}>
            
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>

              <View style={styles.inputContainer}>
                <Feather
                  name="user"
                  size={18}
                  color="#8995A6"
                />

                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A0A9B5"
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="off"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Email Address
              </Text>

              <View style={styles.inputContainer}>
                <Feather
                  name="mail"
                  size={18}
                  color="#8995A6"
                />

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
              <Text style={styles.label}>
                Password
              </Text>

              <PasswordInput
                value={password}
                setValue={setPassword}
                visible={showPassword}
                setVisible={setShowPassword}
                placeholder="Enter your password"
              />

              <Text style={styles.passwordHint}>
                At least 6 characters, with a combination of uppercase, lowercase, and number.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Confirm Password
              </Text>

              <PasswordInput
                value={confirm}
                setValue={setConfirm}
                visible={showConfirm}
                setVisible={setShowConfirm}
                placeholder="Re-enter your password"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.disabledButton,
              ]}
              disabled={loading}
              onPress={register}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>
                    Create Account
                  </Text>

                  <Feather
                    name="arrow-right"
                    size={18}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>
                  Sign In
                </Text>
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
    backgroundColor: "#F5F8FC",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },

  webScroll: {
    paddingVertical: 30,
  },

  wrapper: {
    width: "100%",
    alignSelf: "center",
  },

  webWrapper: {
    maxWidth: 520,
  },

  topBar: {
    height: 43,
    marginBottom: 10,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4EAF2",
  },

  brand: {
    alignItems: "center",
    marginBottom: 21,
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#1769E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  brandName: {
    fontSize: 25,
    fontWeight: "800",
    color: "#152238",
  },

  brandSubtitle: {
    fontSize: 12,
    color: "#8995A6",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E8EDF4",
  },

  webCard: {
    padding: 32,
    borderRadius: 25,
    boxShadow: "0px 8px 20px rgba(21, 34, 56, 0.07)",
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#344054",
    marginBottom: 7,
  },

  inputContainer: {
    height: 53,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DCE3EC",
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

  registerButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#1769E0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },

  disabledButton: {
    opacity: 0.6,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  loginRow: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  loginText: {
    fontSize: 13,
    color: "#7A8798",
  },

  loginLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1769E0",
    marginLeft: 5,
  },

  passwordHint: {
    fontSize: 11,
    color: "#8995A6",
    marginTop: 6,
    lineHeight: 16,
  },
});