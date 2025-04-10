'use client'

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function CreateUserPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [company, setCompany] = useState("")
  const [lineChannelId, setLineChannelId] = useState("")
  const [lineChannelSecret, setLineChannelSecret] = useState("")
  const [lineChannelAccessToken, setLineChannelAccessToken] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        metadata: {
          company,
          line_channel_id: lineChannelId,
          line_channel_secret: lineChannelSecret,
          line_channel_access_token: lineChannelAccessToken,
        },
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
        router.push("/admin")
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">新規ユーザー登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>メールアドレス</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label>パスワード</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <Label>会社名</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
        </div>
        <div>
          <Label>LINE Channel ID</Label>
          <Input value={lineChannelId} onChange={(e) => setLineChannelId(e.target.value)} required />
        </div>
        <div>
          <Label>LINE Channel Secret</Label>
          <Input value={lineChannelSecret} onChange={(e) => setLineChannelSecret(e.target.value)} required />
        </div>
        <div>
          <Label>LINE Channel Access Token</Label>
          <Input value={lineChannelAccessToken} onChange={(e) => setLineChannelAccessToken(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "登録中..." : "ユーザー登録"}
        </Button>
      </form>
    </div>
  )
}
