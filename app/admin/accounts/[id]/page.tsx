'use client'

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/database.types"
import Link from "next/link"

export default function AccountDetailPage() {
  const [account, setAccount] = useState<Tables<'accounts'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { id } = useParams()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .eq("id", id as string)
          .single()

        if (error) {
          setError("アカウント情報の取得に失敗しました")
        } else {
          setAccount(data)
        }
      } catch (err) {
        setError("アカウント情報の取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!account) {
      setError('更新に失敗しました')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("accounts")
      .update({
        name: account.name,
        email: account.email,
        line_channel_id: account.line_channel_id,
        line_channel_secret: account.line_channel_secret,
        line_channel_access_token: account.line_channel_access_token,
      })
      .eq("id", id as string)

    if (error) {
      toast({ title: "更新失敗", description: error.message, variant: "destructive" })
      setLoading(false)
      return
    }

  }

  if (loading) {
    return <p>読み込み中...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">アカウント詳細</h1>
      <Button asChild><Link href={`/admin/accounts/${account?.id}/images`} className="text-blue-500 underline mb-4">画像設定はこちら</Link></Button>
      {account && (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label>会社名</Label>
            <Input
              value={account.name}
              onChange={(e) => setAccount({ ...account, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>メールアドレス</Label>
            <Input
              value={account.email ?? ''}
              onChange={(e) => setAccount({ ...account, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>LINE Channel ID</Label>
            <Input
              value={account.line_channel_id}
              onChange={(e) => setAccount({ ...account, line_channel_id: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>LINE Channel Secret</Label>
            <Input
              value={account.line_channel_secret}
              onChange={(e) => setAccount({ ...account, line_channel_secret: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>LINE Channel Access Token</Label>
            <Input
              value={account.line_channel_access_token}
              onChange={(e) => setAccount({ ...account, line_channel_access_token: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "更新中..." : "更新"}
          </Button>
        </form>
      )}
    </div>
  )
}
