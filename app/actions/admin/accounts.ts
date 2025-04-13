'use server'
import { createClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export async function registerUser(prevState: any, formData: FormData) {
    const supabaseAdmin = await createClient()

    const email = formData.get("email")?.toString() || undefined
    const password = formData.get("password")?.toString() || undefined

    // Create a new user in Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (userError) {
        console.error("ユーザー登録エラー:", userError)
        return { message: userError.message }
    }

    const user = userData.user

    const newAccountData = {
        user_id: user.id,
        name: formData.get("company")?.toString() || "",
        email: user.email,
        line_channel_id: formData.get("line_channel_id")?.toString() || "",
        line_channel_secret: formData.get("line_channel_secret")?.toString() || "",
        line_channel_access_token: formData.get("line_channel_access_token")?.toString() || "",
        tel: formData.get("tel")?.toString() || "",
        hours: formData.get("hours")?.toString() || "",
    }
    // accounts テーブルに登録
    const { error: insertError } = await supabaseAdmin.from("accounts").insert(newAccountData)

    if (insertError) {
        console.error("アカウント登録エラー:", insertError)
        return { message: "アカウント登録に失敗しました" }
    }

    redirect("/admin")
}

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

    console.log(updatedData)

    console.log(prevState.user_id)
  
    const { error } = await supabase
      .from("accounts")
      .update(updatedData)
      .eq("user_id", prevState.user_id)
  
    if (error) {
      return { message: 'アカウント情報の更新に失敗しました' }
    }
  
    redirect("/admin")
}
  