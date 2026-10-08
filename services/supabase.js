import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://neorjrlkfpdoaipycdla.supabase.co";
const supabasePublishableKey =
  "sb_publishable_siV1MPVToO4LRS1UqUZDMA_4nB3yrIj";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);