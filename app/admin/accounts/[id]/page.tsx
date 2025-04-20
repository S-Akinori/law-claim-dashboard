import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AdminAccountForm from "@/components/form/admin-account-form"
import AdminCopyMasterDataForm from "@/components/form/admin-copy-master-data-form"
import AdminChangeMasterModeForm from "@/components/form/admin-change-master-mode-from"

import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
  Image,
  ArrowRight,
  Play,
  Mail,
  Clock,
  Calculator,
} from "lucide-react"


export default async function AccountDetailPage({ params }: { params: { id: string } }) {

  const { id } = params

  const routes = [
    {
      href: `/admin/accounts/${id}/questions`,
      label: "質問管理",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: `/admin/accounts/${id}/routes`,
      label: "質問ルート",
      icon: <ArrowRight className="h-5 w-5" />,
    },
    {
      href: `/admin/accounts/${id}/triggers`,
      label: "スタートトリガー",
      icon: <Play className="h-5 w-5" />,
    },
    {
      href: `/admin/accounts/${id}/scheduled-messages`,
      label: "定期メッセージ",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      href: `/admin/accounts/${id}/email-templates`,
      label: "メールテンプレート",
      icon: <Mail className="h-5 w-5" />,
    },
  ]

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
    <div className="mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{accountData.name}</h1>
      <div className="my-8">
        <Card>
          <CardHeader>
            <CardTitle>アカウント設定</CardTitle>
            <CardDescription>アカウントの基本情報</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminAccountForm accountData={accountData} />
          </CardContent>
        </Card>
      </div>
      <div className="my-8">
        <Card>
          <CardHeader>
            <CardTitle>アカウント画像設定</CardTitle>
            <CardDescription>選択肢の画像を変更できます</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href={`/admin/accounts/${accountData.id}/images`} className="text-blue-500 underline mb-4">画像設定はこちら</Link></Button>
          </CardContent>
        </Card>
      </div>
      <div className="my-8">
        {accountData.use_master && (
          <Card>
            <CardHeader>
              <CardTitle>個別質問に切り替え</CardTitle>
              <CardDescription>現在マスターデータを使用しています。個別で設定したい場合は下記ボタンから切り替えてください。</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">個別質問に切り替える</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>本当に個別質問に切り替えてよろしいですか？</DialogTitle>
                    <DialogDescription>切り替えをするとうまく動作しない可能性があります。</DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" >キャンセル</Button>
                    </DialogClose>
                    <AdminCopyMasterDataForm accountId={accountData.id} />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
        {!accountData.use_master && (
          <Card>
            <CardHeader>
              <CardTitle>マスターデータに変更</CardTitle>
              <CardDescription>個別質問をマスターデータに変更します。マスターデータを使用する場合は下記ボタンから変更してください。</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">マスターデータに変更</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>変更してよろしいですか？</DialogTitle>
                    <DialogDescription>個別質問は残ります。</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">キャンセル</Button>
                    </DialogClose>
                    <AdminChangeMasterModeForm accountId={accountData.id} />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
      {!accountData.use_master && routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted `}
        >
          {route.icon}
          {route.label}
        </Link>
      ))}
    </div>
  )
}
