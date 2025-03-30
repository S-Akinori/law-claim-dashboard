"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { loginAction } from "../actions/auth"

// 送信ボタンコンポーネント
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "ログイン中..." : "ログイン"}
    </Button>
  )
}

// 初期状態
const initialState = {
  error: null,
}

export function LoginFormWrapper({
  redirectedFrom,
  serverError,
}: {
  redirectedFrom: string
  serverError?: string
}) {
  // フォームの状態管理 - サーバーアクションをバインド
  const [state, formAction] = useActionState(loginAction, initialState)
  const [clientError, setClientError] = useState<string | null>(null)

  // エラーメッセージの表示（サーバーエラーまたはクライアントエラー）
  const errorMessage = serverError || state?.error || clientError

  return (
    <form action={formAction} className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <input type="hidden" name="redirectTo" value={redirectedFrom} />

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" placeholder="your@email.com" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">パスワード</Label>
          <Link href="/reset-password" className="text-xs text-primary hover:underline">
            パスワードをお忘れですか？
          </Link>
        </div>
        <Input id="password" name="password" type="password" required />
      </div>

      <SubmitButton />
    </form>
  )
}

