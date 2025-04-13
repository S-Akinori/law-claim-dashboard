import AccountForm from "@/components/form/account-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function EditAccount() {
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

  if (accountError) {
    console.error("アカウント情報取得エラー:", accountError)
    return <p>アカウント情報取得エラー: {accountError.message}</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">アカウント情報編集</h1>
        <p className="text-muted-foreground">アカウント情報を編集できます</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>アカウント情報</CardTitle>
          <CardDescription>以下のフォームでアカウント情報を編集できます</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm accountData={accountData} />
        </CardContent>
      </Card>
    </div>
  )
}
