// lib/supabase/admin.ts
import { Database } from "@/database.types"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ※絶対にフロントには使わない
)

export { supabaseAdmin }
