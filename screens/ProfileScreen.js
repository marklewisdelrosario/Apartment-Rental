import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../services/supabase";
import { showAlert } from "../services/alert";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;

const PasswordInput = ({
  value,
  setValue,
  visible,
  setVisible,
  icon,
  placeholder,
  autoFocus = false,
}) => (
  <View style={[styles.inputBox, styles.passwordInputBox]}>
    <Feather name={icon} size={17} color="#8995A6" />

    <TextInput
      value={value}
      onChangeText={setValue}
      placeholder={placeholder}
      placeholderTextColor="#A0A9B5"
      secureTextEntry={!visible}
      style={styles.input}
      autoFocus={autoFocus}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="off"
      textContentType="none"
      importantForAutofill="no"
    />

    <Pressable
      style={styles.eyeButton}
      onPress={() => setVisible((value) => !value)}
    >
      <Feather
        name={visible ? "eye-off" : "eye"}
        size={18}
        color="#8995A6"
      />
    </Pressable>
  </View>
);

export default function ProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigation.replace("Login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .eq("id", user.id)
        .single();

      if (error) {
        showAlert("Error", error.message);
        return;
      }

      const result = {
        ...data,
        email: user.email || data.email || "",
      };

      setProfile(result);
      setName(result.full_name || "");
      setEmail(result.email);
    } catch (error) {
      showAlert(
        "Error",
        error.message || "Unable to load your profile."
      );
    }
  };

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const startEditing = (section) => {
    if (editingSection) return;

    if (section === "name") {
      setName(profile?.full_name || "");
    }

    if (section === "email") {
      setEmail(profile?.email || "");
      setCurrentPassword("");
      setShowCurrentPassword(false);
    }

    if (section === "password") {
      resetPasswordFields();
    }

    setEditingSection(section);
  };

  const cancelEditing = () => {
    if (editingSection === "name") {
      setName(profile?.full_name || "");
    }

    if (editingSection === "email") {
      setEmail(profile?.email || "");
      setCurrentPassword("");
    }

    if (editingSection === "password") {
      resetPasswordFields();
    }

    setEditingSection(null);
  };

  const saveName = async () => {
    const cleanName = name.trim();

    if (!cleanName || !nameRegex.test(cleanName)) {
      showAlert("Invalid Name", "Please enter a valid full name.");
      return;
    }

    if (cleanName === profile?.full_name) {
      setEditingSection(null);
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showAlert("Error", "User session not found.");
        return;
      }

      const { error: authError } =
        await supabase.auth.updateUser({
          data: {
            full_name: cleanName,
          },
        });

      if (authError) {
        showAlert("Update Failed", authError.message);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: cleanName,
        })
        .eq("id", user.id)
        .select("id, full_name, email, created_at")
        .single();

      if (error) {
        showAlert("Database Update Failed", error.message);
        return;
      }

      setProfile({
        ...data,
        email: user.email || data.email || "",
      });

      setName(cleanName);
      setEditingSection(null);

      showAlert(
        "Changes Saved",
        "Your name has been updated successfully."
      );
    } catch (error) {
      showAlert(
        "Error",
        error.message || "Unable to update your name."
      );
    } finally {
      setSaving(false);
    }
  };

  const verifyPassword = async (user, password) => {
    const { error } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

    return error;
  };

  const saveEmail = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      showAlert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (!currentPassword) {
      showAlert(
        "Password Required",
        "Please enter your current password."
      );
      return;
    }

    if (
      cleanEmail ===
      (profile?.email || "").trim().toLowerCase()
    ) {
      setCurrentPassword("");
      setEditingSection(null);
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        showAlert(
          "Error",
          "User session not found."
        );
        return;
      }

      const passwordError = await verifyPassword(
        user,
        currentPassword
      );

      if (passwordError) {
        showAlert(
          "Incorrect Password",
          "Your current password is incorrect."
        );
        return;
      }

      const { error: authError } = await supabase.auth.updateUser(
        { email: cleanEmail },
        { emailRedirectTo: `${window.location.origin}/profile` }
      );

      if (authError) {
        showAlert(
          "Email Update Failed",
          authError.message
        );
        return;
      }

      setCurrentPassword("");
      setShowCurrentPassword(false);
      setEditingSection(null);

      showAlert(
        "Confirmation Email Sent",
        `A confirmation email was sent to ${cleanEmail}.\n\nOpen the email and click the confirmation link to complete the email change.`
      );
    } catch (error) {
      showAlert(
        "Error",
        error.message || "Unable to update your email."
      );
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword) {
      showAlert(
        "Current Password Required",
        "Enter your current password."
      );
      return;
    }

    if (!newPassword) {
      showAlert(
        "New Password Required",
        "Enter your new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      showAlert(
        "Invalid Password",
        "Your new password must contain at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      showAlert(
        "Confirm Password Required",
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(
        "Password Mismatch",
        "The new password and confirmation do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      showAlert(
        "Invalid Password",
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        showAlert("Error", "User session not found.");
        return;
      }

      const passwordError = await verifyPassword(
        user,
        currentPassword
      );

      if (passwordError) {
        showAlert(
          "Incorrect Password",
          "Your current password is incorrect. No changes were made."
        );
        return;
      }

      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        showAlert(
          "Password Update Failed",
          error.message
        );
        return;
      }

      resetPasswordFields();
      setEditingSection(null);

      showAlert(
        "Password Changed",
        "Your password has been updated successfully."
      );
    } catch (error) {
      showAlert(
        "Error",
        error.message || "Unable to update your password."
      );
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      showAlert(
        "Sign Out Failed",
        error.message
      );
      return;
    }

    navigation.replace("Login");
  };

  const initials = name.trim()
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "U";

  const EditActions = ({ section, save }) =>
    editingSection === section ? (
      <View style={styles.actionRow}>
        <Pressable
          style={styles.cancelSmall}
          onPress={cancelEditing}
          disabled={saving}
        >
          <Text style={styles.cancelSmallText}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          style={styles.saveSmall}
          onPress={save}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.saveSmallText}>
              Save
            </Text>
          )}
        </Pressable>
      </View>
    ) : (
      <Pressable
        style={styles.editSmall}
        onPress={() => startEditing(section)}
        disabled={editingSection !== null}
      >
        <Feather
          name="edit-2"
          size={15}
          color="#1769E0"
        />

        <Text style={styles.editSmallText}>
          Edit
        </Text>
      </Pressable>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.container,
            isWeb && styles.webContainer,
          ]}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather
                name="arrow-left"
                size={20}
                color="#152238"
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                My Profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Manage your account
              </Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {initials}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.full_name || "User"}
              </Text>

              <Text style={styles.profileEmail}>
                {profile?.email || "No email"}
              </Text>

              <View style={styles.accountBadge}>
                <View style={styles.activeDot} />

                <Text style={styles.accountBadgeText}>
                  Active Account
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Account Details
            </Text>

            <Text style={styles.sectionSubtitle}>
              Update your information individually
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardIcon}>
                <Feather
                  name="user"
                  size={18}
                  color="#1769E0"
                />
              </View>

              <View style={styles.cardTitleArea}>
                <Text style={styles.cardLabel}>
                  FULL NAME
                </Text>

                {editingSection !== "name" && (
                  <Text style={styles.cardValue}>
                    {profile?.full_name ||
                      "Not provided"}
                  </Text>
                )}
              </View>

              <EditActions
                section="name"
                save={saveName}
              />
            </View>

            {editingSection === "name" && (
              <View style={styles.editInputWrapper}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A0A9B5"
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardIcon}>
                <Feather
                  name="mail"
                  size={18}
                  color="#1769E0"
                />
              </View>

              <View style={styles.cardTitleArea}>
                <Text style={styles.cardLabel}>
                  EMAIL ADDRESS
                </Text>

                {editingSection !== "email" && (
                  <Text
                    style={styles.cardValue}
                    numberOfLines={1}
                  >
                    {profile?.email ||
                      "Not provided"}
                  </Text>
                )}
              </View>

              <EditActions
                section="email"
                save={saveEmail}
              />
            </View>

            {editingSection === "email" && (
              <View style={styles.emailEditArea}>
                <View style={styles.inputBox}>
                  <Feather
                    name="mail"
                    size={17}
                    color="#8995A6"
                  />

                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#A0A9B5"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    autoFocus
                  />
                </View>

                <PasswordInput
                  value={currentPassword}
                  setValue={setCurrentPassword}
                  visible={showCurrentPassword}
                  setVisible={setShowCurrentPassword}
                  icon="lock"
                  placeholder="Current password"
                />
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardIcon}>
                <Feather
                  name="lock"
                  size={18}
                  color="#1769E0"
                />
              </View>

              <View style={styles.cardTitleArea}>
                <Text style={styles.cardLabel}>
                  PASSWORD
                </Text>

                {editingSection !== "password" && (
                  <Text style={styles.cardValue}>
                    ••••••••
                  </Text>
                )}
              </View>

              <EditActions
                section="password"
                save={savePassword}
              />
            </View>

            {editingSection === "password" && (
              <View style={styles.passwordEditArea}>
                <PasswordInput
                  value={currentPassword}
                  setValue={setCurrentPassword}
                  visible={showCurrentPassword}
                  setVisible={setShowCurrentPassword}
                  icon="lock"
                  placeholder="Current password"
                  autoFocus
                />

                <PasswordInput
                  value={newPassword}
                  setValue={setNewPassword}
                  visible={showNewPassword}
                  setVisible={setShowNewPassword}
                  icon="key"
                  placeholder="New password"
                />

                <PasswordInput
                  value={confirmPassword}
                  setValue={setConfirmPassword}
                  visible={showConfirmPassword}
                  setVisible={setShowConfirmPassword}
                  icon="check-circle"
                  placeholder="Confirm new password"
                />
              </View>
            )}
          </View>

          <Pressable
            style={styles.signOutButton}
            onPress={signOut}
            disabled={
              editingSection !== null ||
              saving
            }
          >
            <View style={styles.signOutLeft}>
              <View style={styles.signOutIcon}>
                <Feather
                  name="log-out"
                  size={18}
                  color="#E53935"
                />
              </View>

              <View>
                <Text style={styles.signOutTitle}>
                  Sign Out
                </Text>

                <Text style={styles.signOutSubtitle}>
                  Sign out of your account
                </Text>
              </View>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color="#A5ADBA"
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 35,
  },

  container: {
    width: "100%",
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  webContainer: {
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 30,
  },

  header: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4EAF2",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: "#152238",
    fontSize: 18,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#8A94A3",
    fontSize: 11,
    marginTop: 2,
  },

  headerSpacer: {
    width: 44,
  },

  profileCard: {
    backgroundColor: "#1769E0",
    borderRadius: 22,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 27,
    shadowColor: "#1769E0",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.25)",
  },

  avatarText: {
    color: "#1769E0",
    fontSize: 25,
    fontWeight: "800",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  profileEmail: {
    color: "#DCE9FF",
    fontSize: 12,
    marginTop: 4,
  },

  accountBadge: {
    alignSelf: "flex-start",
    marginTop: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.13)",
    flexDirection: "row",
    alignItems: "center",
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },

  accountBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#152238",
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#8995A6",
    fontSize: 12,
    marginTop: 3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8EDF4",
    shadowColor: "#152238",
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
    marginBottom: 13,
  },

  cardTop: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitleArea: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  cardLabel: {
    color: "#8995A6",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 4,
  },

  cardValue: {
    color: "#202A3A",
    fontSize: 14,
    fontWeight: "600",
  },

  editSmall: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: "#EAF2FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  editSmallText: {
    color: "#1769E0",
    fontSize: 11,
    fontWeight: "800",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  cancelSmall: {
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelSmallText: {
    color: "#6E7785",
    fontSize: 10,
    fontWeight: "700",
  },

  saveSmall: {
    height: 34,
    minWidth: 52,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: "#1769E0",
    alignItems: "center",
    justifyContent: "center",
  },

  saveSmallText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  editInputWrapper: {
    height: 51,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#1769E0",
    backgroundColor: "#FAFBFD",
    paddingHorizontal: 14,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  inputBox: {
    height: 51,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    backgroundColor: "#FAFBFD",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInputBox: {
    marginTop: 14,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    color: "#152238",
    fontSize: 14,
    outlineStyle: "none",
  },

  emailEditArea: {
    marginTop: 0,
  },

  passwordEditArea: {
    marginTop: 14,
  },

  eyeButton: {
    width: 36,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  signOutButton: {
    minHeight: 68,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E4E3",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },

  signOutLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  signOutIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: "#FFF0EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  signOutTitle: {
    color: "#D93632",
    fontSize: 13,
    fontWeight: "800",
  },

  signOutSubtitle: {
    color: "#A1A8B3",
    fontSize: 10,
    marginTop: 2,
  },
});