import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminAccountForm from "@/components/form/admin-account-form"

export default async function AccountDetailPage({ params }: { params: { id: string } }) {

  const supabase = await createClient()
  const { data: accountData, error: accountError } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!accountData || accountError) {
    console.error("アカウント情報取得エラー:", accountError)
    return <p>アカウント情報取得エラー: {accountError.message}</p>
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">アカウント詳細</h1>
      <Button asChild><Link href={`/admin/accounts/${accountData.id}/images`} className="text-blue-500 underline mb-4">画像設定はこちら</Link></Button>
      <AdminAccountForm accountData={accountData} />
    </div>
  )
}
