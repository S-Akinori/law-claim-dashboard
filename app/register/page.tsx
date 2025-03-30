"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("パスワードが一致しません")
      setLoading(false)
      return
    }

    try {
      // 1. 先にユーザー登録を行う
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError("ユーザー登録に失敗しました")
        setLoading(false)
        return
      }

      // 2. 次にアカウント情報を登録
      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .insert([
          {
            name: companyName,
            user_id: authData.user.id, // ユーザーIDを関連付け
            line_channel_id: "",
            line_channel_secret: "",
            line_channel_access_token: "",
          },
        ])
        .select("id")
        .single()

      if (accountError) {
        console.error("アカウント情報登録エラー:", accountError)
        setError("アカウント情報の登録に失敗しました")
        setLoading(false)
        return
      }

      // 3. ユーザーメタデータにアカウントIDを追加
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { account_id: accountData.id },
      })

      if (updateUserError) {
        console.error("ユーザー情報更新エラー:", updateUserError)
        // 致命的ではないのでエラーは表示しない
      }

      // 4. セッションの確認
      const { data: sessionData } = await supabase.auth.getSession()

      if (sessionData.session) {
        router.push("/dashboard")
        router.refresh()
      } else {
        // メール確認が必要な場合
        router.push("/register/confirmation")
      }
    } catch (err) {
      console.error("登録エラー:", err)
      setError("登録中にエラーが発生しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          ホームに戻る
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">アカウント登録</CardTitle>
            <CardDescription>新しいアカウントを作成して管理パネルにアクセスしましょう</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="company">会社名</Label>
                <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "登録中..." : "アカウント登録"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              すでにアカウントをお持ちの場合は{" "}
              <Link href="/login" className="text-primary hover:underline">
                ログイン
              </Link>
              してください
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

