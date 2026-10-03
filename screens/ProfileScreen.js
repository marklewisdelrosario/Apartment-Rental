import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../services/supabase";

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [p, setP] = useState(null);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("09");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const profile = data || {
        full_name: user.user_metadata?.full_name || "Tenant",
        email: user.email,
        phone: "09",
        avatar_url: null,
      };

      setP(profile);
      setName(profile.full_name || "");

      const savedPhone = (profile.phone || "").replace(/\D/g, "");

      setPhone(
        savedPhone.startsWith("09")
          ? savedPhone.slice(0, 11)
          : "09"
      );
    } catch {
      Alert.alert("Error", "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const photo = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Error", "Photo permission is required.");
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (result.canceled) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const response = await fetch(result.assets[0].uri);
      const buffer = await response.arrayBuffer();
      const path = `${user.id}/profile.jpg`;

      const { error } = await supabase.storage
        .from("profile-images")
        .upload(path, buffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(path);

      const url = `${data.publicUrl}?t=${Date.now()}`;

      const { data: updated, error: updateError } =
        await supabase
          .from("profiles")
          .update({ avatar_url: url })
          .eq("id", user.id)
          .select()
          .single();

      if (updateError) throw updateError;

      setP(updated);

      Alert.alert("Success", "Photo updated.");
    } catch {
      Alert.alert("Error", "Unable to update photo.");
    }
  };

  const save = async () => {
    const cleanPhone = phone.replace(/\D/g, "").slice(0, 11);

    const nameChanged =
      name.trim() !== (p?.full_name || "").trim();

    const phoneChanged =
      cleanPhone !== (p?.phone || "").trim();

    const passwordChanged = pass.length > 0;

    if (
      !nameChanged &&
      !phoneChanged &&
      !passwordChanged
    ) {
      Alert.alert(
        "No Changes",
        "You haven't made any changes."
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    if (!/^09\d{9}$/.test(cleanPhone)) {
      Alert.alert(
        "Error",
        "Phone number must be exactly 11 digits and start with 09."
      );
      return;
    }

    if (passwordChanged) {
      if (pass.length < 6) {
        Alert.alert(
          "Error",
          "Password must be at least 6 characters."
        );
        return;
      }

      if (pass !== confirm) {
        Alert.alert(
          "Error",
          "Passwords do not match."
        );
        return;
      }
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "Unable to update profile.");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          phone: cleanPhone,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      if (passwordChanged) {
        const { error: passwordError } =
          await supabase.auth.updateUser({
            password: pass,
          });

        if (passwordError) throw passwordError;
      }

      setP(data);
      setName(data.full_name || "");
      setPhone(cleanPhone);
      setPass("");
      setConfirm("");
      setShow(false);
      setShowConfirm(false);
      setEdit(false);

      Alert.alert(
        "Success",
        "Your changes have been saved."
      );
    } catch {
      Alert.alert(
        "Error",
        "Unable to save your changes."
      );
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const initials = (p?.full_name || "T")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#2563EB" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: 40 + insets.bottom,
      }}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.small}>ACCOUNT</Text>
          <Text style={styles.title}>My Profile</Text>
        </View>

        <TouchableOpacity
          style={styles.close}
          onPress={() => navigation.goBack()}
        >
          <Feather name="x" size={21} />
        </TouchableOpacity>
      </View>

      <View style={styles.profile}>
        {p?.avatar_url ? (
          <Image
            source={{ uri: p.avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <Text style={styles.initials}>
            {initials}
          </Text>
        )}

        <Text style={styles.profileName}>
          {p?.full_name || "Tenant"}
        </Text>

        <Text style={styles.tenant}>
          🏠 Tenant
        </Text>

        <TouchableOpacity
          style={styles.photoButton}
          onPress={photo}
        >
          <Feather
            name="image"
            size={15}
            color="#fff"
          />

          <Text style={styles.photoText}>
            Change Photo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        {!edit && (
          <TouchableOpacity
            style={styles.edit}
            onPress={() => setEdit(true)}
          >
            <Feather
              name="edit-2"
              size={14}
              color="#2563EB"
            />

            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        {edit ? (
          <>
            <Text style={styles.label}>
              Full Name
            </Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
            />

            <Text style={styles.label}>
              Phone
            </Text>

            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(text) => {
                let numbers = text.replace(/\D/g, "");

                if (numbers.length < 2) {
                  numbers = "09";
                } else {
                  numbers = "09" + numbers.slice(2);
                }

                setPhone(numbers.slice(0, 11));
              }}
              placeholder="09XXXXXXXXX"
              keyboardType="number-pad"
              maxLength={11}
            />

            <Text style={styles.phoneHint}>
              11 digits required
            </Text>

            <Text style={styles.label}>
              Email
            </Text>

            <View style={styles.email}>
              <Text>{p?.email}</Text>

              <Feather
                name="lock"
                size={14}
                color="#999"
              />
            </View>

            <Text style={styles.label}>
              New Password
            </Text>

            <View style={styles.password}>
              <TextInput
                style={{ flex: 1 }}
                value={pass}
                onChangeText={setPass}
                placeholder="New password"
                secureTextEntry={!show}
              />

              <TouchableOpacity
                onPress={() => setShow(!show)}
              >
                <Feather
                  name={show ? "eye-off" : "eye"}
                  size={19}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            {pass.length > 0 && (
              <>
                <Text style={styles.label}>
                  Confirm Password
                </Text>

                <View style={styles.password}>
                  <TextInput
                    style={{ flex: 1 }}
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="Confirm password"
                    secureTextEntry={!showConfirm}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowConfirm(!showConfirm)
                    }
                  >
                    <Feather
                      name={
                        showConfirm
                          ? "eye-off"
                          : "eye"
                      }
                      size={19}
                      color="#777"
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancel}
                onPress={() => {
                  setEdit(false);
                  setPass("");
                  setConfirm("");
                  setShow(false);
                  setShowConfirm(false);
                  setPhone(p?.phone || "09");
                  setName(p?.full_name || "");
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.save}
                onPress={save}
              >
                <Text style={styles.buttonText}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Info
              icon="user"
              label="Full Name"
              value={p?.full_name}
            />

            <Info
              icon="mail"
              label="Email"
              value={p?.email}
            />

            <Info
              icon="phone"
              label="Phone"
              value={
                p?.phone || "Not provided"
              }
            />

            <Info
              icon="lock"
              label="Password"
              value="••••••••"
            />
          </>
        )}
      </View>

      <Text style={styles.sectionTitle}>
        Account
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          Alert.alert(
            "My Bookings",
            "Booking history will be available here."
          )
        }
      >
        <View style={styles.menu}>
          <View style={styles.icon}>
            <Feather
              name="calendar"
              size={20}
              color="#2563EB"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>
              My Bookings
            </Text>

            <Text style={styles.sub}>
              View your rental history
            </Text>
          </View>

          <Feather
            name="chevron-right"
            size={20}
            color="#999"
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logout}
        onPress={logout}
      >
        <Feather
          name="log-out"
          size={18}
          color="#DC2626"
        />

        <Text style={styles.logoutText}>
          Log Out
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Smart Apartment Rental System
      </Text>
    </ScrollView>
  );
}

function Info({ icon, label, value }) {
  return (
    <View style={styles.info}>
      <View style={styles.icon}>
        <Feather
          name={icon}
          size={18}
          color="#2563EB"
        />
      </View>

      <View>
        <Text style={styles.label}>
          {label}
        </Text>

        <Text style={styles.value}>
          {value || "Not provided"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  small: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  title: {
    color: "#172033",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 4,
  },

  close: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  profile: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    padding: 25,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },

  initials: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#fff",
    color: "#2563EB",
    fontSize: 29,
    fontWeight: "800",
    textAlign: "center",
    textAlignVertical: "center",
  },

  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 12,
  },

  tenant: {
    color: "#fff",
    marginTop: 7,
  },

  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,.15)",
  },

  photoText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
  },

  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },

  sectionTitle: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 10,
  },

  edit: {
    flexDirection: "row",
    backgroundColor: "#EAF1FF",
    padding: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 15,
  },

  editText: {
    color: "#2563EB",
    fontWeight: "800",
    marginLeft: 5,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 19,
    padding: 16,
    elevation: 2,
    marginBottom: 10,
  },

  info: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F3",
  },

  icon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  label: {
    color: "#8A92A3",
    fontSize: 11,
    marginBottom: 4,
  },

  value: {
    color: "#172033",
    fontWeight: "700",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DCE2EA",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    color: "#172033",
  },

  phoneHint: {
    color: "#8A92A3",
    fontSize: 10,
    marginTop: -9,
    marginBottom: 14,
  },

  email: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  password: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DCE2EA",
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },

  cancel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  save: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },

  menu: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuTitle: {
    fontWeight: "800",
    color: "#172033",
  },

  sub: {
    color: "#8A92A3",
    fontSize: 11,
    marginTop: 3,
  },

  logout: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "800",
    marginLeft: 8,
  },

  footer: {
    textAlign: "center",
    color: "#9AA1AE",
    fontSize: 11,
    marginTop: 25,
  },
});