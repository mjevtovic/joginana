import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMuxUpload } from "@/lib/mux/server";

/**
 * POST /api/mux/upload
 * Creates a Mux direct upload URL.
 * Only admin users can create uploads.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the origin for CORS (allows direct browser upload)
    const origin = request.headers.get("origin") || undefined;
    const { uploadId, uploadUrl } = await createMuxUpload(origin);

    return NextResponse.json({ uploadId, uploadUrl });
  } catch (error) {
    console.error("Mux upload error:", error);
    return NextResponse.json(
      { error: "Failed to create upload" },
      { status: 500 }
    );
  }
}
