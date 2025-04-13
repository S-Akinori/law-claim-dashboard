'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function updateAccount(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const updatedData = {
    name: formData.get("name")?.toString() || undefined,
    email: formData.get("email")?.toString() || undefined,
    line_channel_secret: formData.get("line_channel_secret")?.toString() || undefined,
    line_channel_access_token: formData.get("line_channel_access_token")?.toString() || undefined,
    tel: formData.get("tel")?.toString() || undefined,
    hours: formData.get("hours")?.toString() || undefined,
  }

  const { error } = await supabase
    .from("accounts")
    .update(updatedData)
    .eq("user_id", prevState.user_id)

  if (error) {
    return {message: 'アカウント情報の更新に失敗しました'}
  }

  redirect("/dashboard")
}
