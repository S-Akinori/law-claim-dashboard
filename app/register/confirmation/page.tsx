"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function RegisterConfirmation() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">登録完了</CardTitle>
            <CardDescription className="text-center">
              アカウント登録が完了しました。メールアドレスの確認をお願いします。
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              登録したメールアドレスに確認メールを送信しました。メール内のリンクをクリックして、アカウントを有効化してください。
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/login">ログインページへ</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

