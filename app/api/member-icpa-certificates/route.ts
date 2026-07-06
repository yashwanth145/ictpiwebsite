import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { formatSupabaseError } from "@/lib/candidateExamSchedule";
import { listMemberIcpaCertificateSlots, listMemberIcpaCertificates } from "@/lib/icpaCertificateStorage";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseAdmin() {
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  const key = serviceKey || anonKey;
  if (!key) {
    throw new Error(
      "Missing Supabase keys: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** GET /api/member-icpa-certificates?membershipId=100202 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const membershipIdParam = searchParams.get("membershipId")?.trim();

    if (!membershipIdParam) {
      return NextResponse.json(
        { error: "Provide a 'membershipId' query parameter." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const [slots, certificates] = await Promise.all([
      listMemberIcpaCertificateSlots(supabase, membershipIdParam),
      listMemberIcpaCertificates(supabase, membershipIdParam),
    ]);

    return NextResponse.json({ slots, certificates });
  } catch (error: unknown) {
    console.error("member-icpa-certificates API error:", error);
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    );
  }
}
