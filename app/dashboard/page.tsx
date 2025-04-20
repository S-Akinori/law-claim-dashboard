import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  console.log(userData)
  if (userError || !userData.user) {
    console.error("ユーザー情報取得エラー:", userError)
    return <p>ユーザー情報取得エラー</p>
  }
  const { data: accountData, error: accountError } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userData.user.id)
    .single()

  console.log(accountData)
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
                    <li className="mb-4">
                      アカウントID: <br />
                      <Input readOnly value={accountData.id} className="w-full" />
                    </li>
                    <li className="mb-4">
                      アカウント名: 
                      <Input readOnly value={accountData.name} className="w-full" />
                    </li>
                    <li className="mb-4">
                      メールアドレス: 
                      <Input readOnly value={accountData.email} className="w-full" />
                    </li>
                    <li className="mb-4">
                      ラインチャンネルシークレット：
                      <Input readOnly value={accountData.line_channel_secret} className="w-full" />
                    </li>
                    <li className="mb-4">
                      ラインチャンネルアクセストークン：
                      <Input readOnly value={accountData.line_channel_access_token} className="w-full" />
                    </li>
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

