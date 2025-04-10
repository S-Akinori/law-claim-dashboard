// app/api/admin/create-user/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, password, metadata } = await req.json()

  const {
    company,
    line_channel_id,
    line_channel_secret,
    line_channel_access_token,
  } = metadata || {}

  // 入力チェック
  if (!email || !password || !company || !line_channel_id || !line_channel_secret || !line_channel_access_token) {
    return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 })
  }

  // ユーザー作成
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "ユーザー作成に失敗しました" }, { status: 400 })
  }

  const user = data.user

  // accounts テーブルに登録
  const { error: insertError } = await supabaseAdmin.from("accounts").insert({
    user_id: user.id,
    name: company,
    email: user.email,
    line_channel_id,
    line_channel_secret,
    line_channel_access_token,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ user })
}
