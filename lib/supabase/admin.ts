// lib/supabase/admin.ts
import { Database } from "@/database.types"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers";
// import { createClient } from "@supabase/supabase-js"

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ※絶対にフロントには使わない
    {
      cookies: {
        getAll() {
          return [];
        },
      },
    }
  )
}
