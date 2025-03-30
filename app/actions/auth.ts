"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { revalidatePath } from "next/cache"

// ログインアクション
export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard"

  console.log("ログイン処理:", email) // デバッグ用ログを修正

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください",
    }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: { path: string; domain?: string }) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  try {
    // ログイン処理
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        error: error.message,
      }
    }

    if (!data.session) {
      return {
        error: "ログインに失敗しました。もう一度お試しください。",
      }
    }

    // ユーザーがアカウント情報を持っているか確認
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
      // ユーザーIDに関連付けられたアカウント情報を確認
      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", userData.user.id)
        .single()

      if (accountError || !accountData) {
        // アカウント情報が見つからない場合は、メタデータのアカウントIDを確認
        const accountId = userData.user.user_metadata?.account_id

        if (accountId) {
          // アカウントIDがある場合はアカウント情報を確認
          const { data: accountByIdData, error: accountByIdError } = await supabase
            .from("accounts")
            .select("id")
            .eq("id", accountId)
            .single()

          if (accountByIdError || !accountByIdData) {
            // アカウント情報が見つからない場合は新しく作成
            const companyName = userData.user.user_metadata?.company_name || "未設定の会社"

            const { data: newAccountData, error: newAccountError } = await supabase
              .from("accounts")
              .insert([
                {
                  name: companyName,
                  user_id: userData.user.id,
                  line_channel_id: "",
                  line_channel_secret: "",
                  line_channel_access_token: "",
                },
              ])
              .select("id")
              .single()

            if (newAccountError) {
              console.error("アカウント情報作成エラー:", newAccountError)
            } else if (newAccountData) {
              // セッションがあるのでupdateUserを使用できる
              await supabase.auth.updateUser({
                data: { account_id: newAccountData.id },
              })
            }
          }
        } else {
          // アカウントIDがない場合は新しく作成
          const companyName = userData.user.user_metadata?.company_name || "未設定の会社"

          const { data: newAccountData, error: newAccountError } = await supabase
            .from("accounts")
            .insert([
              {
                name: companyName,
                user_id: userData.user.id,
                line_channel_id: "",
                line_channel_secret: "",
                line_channel_access_token: "",
              },
            ])
            .select("id")
            .single()

          if (newAccountError) {
            console.error("アカウント情報作成エラー:", newAccountError)
          } else if (newAccountData) {
            // セッションがあるのでupdateUserを使用できる
            await supabase.auth.updateUser({
              data: { account_id: newAccountData.id },
            })
          }
        }
      }
    }

    // キャッシュを更新
    revalidatePath("/", "layout")

    // リダイレクト
    redirect(redirectTo)
  } catch (err) {
    console.error("ログインエラー:", err)
    return {
      error: "ログイン中にエラーが発生しました。もう一度お試しください。",
    }
  }
}

