import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoginFormWrapper } from "./login-form-wrapper"

export default async function Login({
  searchParams,
}: {
  searchParams: { redirectedFrom?: string; error?: string }
}) {
  // サーバーサイドでセッションをチェック
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // すでにログインしている場合はダッシュボードにリダイレクト
  if (user) {
    const {data: adminUser} = await supabase.from("admin_users").select("*").eq("id", user.id).single()
    return redirect(adminUser ? "/admin" : "/dashboard")
  }

  const redirectedFrom = searchParams.redirectedFrom || "/dashboard"
  const error = searchParams.error

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          ホームに戻る
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">ログイン</CardTitle>
            <CardDescription>アカウント情報を入力してログインしてください</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>読み込み中...</div>}>
              <LoginFormWrapper redirectedFrom={redirectedFrom} serverError={error} />
            </Suspense>
          </CardContent>
          {/* <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              アカウントをお持ちでない場合は{" "}
              <Link href="/register" className="text-primary hover:underline">
                登録
              </Link>
              してください
            </p>
          </CardFooter> */}
        </Card>
      </div>
    </div>
  )
}

