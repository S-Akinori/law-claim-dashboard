import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    console.error("ユーザー情報取得エラー:", userError)
    return <p>ユーザー情報取得エラー</p>
  }
  const { data: accountData, error: accountError } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userData.user.id)
    .single()


  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground">LINE Bot管理システムの概要を確認できます</p>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>現在のアカウント情報を確認できます</CardDescription>
            </CardHeader>
            <CardContent>
              {accountError ? (
                <p className="text-red-500">アカウント情報取得エラー: {accountError.message}</p>
              ) : (
                <div>
                  <ul>
                    <li>アカウントID: {accountData.id}</li>
                    <li>アカウント名: {accountData.name}</li>
                    <li>メールアドレス: {accountData.email}</li>
                    <li>ラインチャンネルシークレット：{accountData.line_channel_secret}</li>
                    <li>ラインチャンネルアクセストークン：{accountData.line_channel_access_token}</li>
                  </ul>
                  <div>
                    <Button asChild>
                      <Link href="/dashboard/accounts/edit" className="text-blue-500 hover:underline">
                       アカウント情報を編集 
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

