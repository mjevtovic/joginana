import { createClient } from "@/lib/supabase/server";

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  return !error && !!data;
}

export async function requireAdmin(): Promise<{ userId: string; isAdmin: true }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Not logged in");
  }

  const adminCheck = await isAdmin(user.id);

  if (!adminCheck) {
    throw new Error("Unauthorized: Not an admin");
  }

  return { userId: user.id, isAdmin: true };
}

export async function canAccessClass(userId: string, classId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get class details
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("access_type, published")
    .eq("id", classId)
    .single();

  if (classError || !classData) {
    return false;
  }

  // Unpublished classes only accessible by admins
  if (!classData.published) {
    return await isAdmin(userId);
  }

  // Free classes accessible by everyone
  if (classData.access_type === "free") {
    return true;
  }

  // Check if user has active subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .single();

  if (profile?.subscription_status === "active") {
    return true;
  }

  // For one_time classes, check if user purchased it
  if (classData.access_type === "one_time") {
    const { data: purchase } = await supabase
      .from("class_purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("class_id", classId)
      .eq("status", "paid")
      .single();

    return !!purchase;
  }

  return false;
}

export function formatPrice(cents: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
}
