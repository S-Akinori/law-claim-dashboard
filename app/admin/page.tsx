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


  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground">LINE Bot管理システムの概要を確認できます</p>
        </div>
        <div className="grid grid-cols-1 gap-6 pt-12">
          <ul>
            {accountData && accountData.map((account) => (
              <li key={account.id} className="border-b py-4">
                <p className="font-bold"><Link href={`/admin/accounts/${account.id}`}>{account.name}</Link></p>
                <p>アカウントID: {account.id}</p>
                <p>WebHook: https://law-claim.consolation-money-bot.com/callback?account_id={account.id}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

