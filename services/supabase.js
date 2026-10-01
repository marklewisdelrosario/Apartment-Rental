import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = "https://neorjrlkfpdoaipycdla.supabase.co";

const supabasePublishableKey =
  "sb_publishable_siV1MPVToO4LRS1UqUZDMA_4nB3yrIj";

const SecureStoreAdapter = {
  getItem: async (key) => {
    return await SecureStore.getItemAsync(key);
  },

  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },

  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);