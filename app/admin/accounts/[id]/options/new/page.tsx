"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ImageGalleryModal } from "@/components/image-gallery-modal"

export default function NewAccountOptionPage() {
  const [masterOptionId, setMasterOptionId] = useState("")
  const [text, setText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [masterOptions, setMasterOptions] = useState<{ id: string; text: string; question_title: string }[]>([])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [account, setAccount] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: optData, error: optError } = await supabase
        .from("master_options")
        .select("id, text, master_questions(title)")

      if (optError) {
        toast({ variant: "destructive", title: "取得エラー", description: "選択肢一覧の取得に失敗しました" })
        return
      }

      const formatted = optData.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        question_title: opt.master_questions?.title || "(未設定)"
      }))
      setMasterOptions(formatted)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({ variant: "destructive", title: "認証エラー", description: "ログインしていません" })
        return
      }

      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (accountError || !accountData) {
        toast({ variant: "destructive", title: "アカウント取得失敗" })
        return
      }

      setAccount(accountData)
    }

    fetchInitialData()
  }, [supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!account) return

      const { error: insertError } = await supabase.from("account_options").insert([
        {
          account_id: account.id,
          master_option_id: masterOptionId,
          text: text || null,
          image_url: imageUrl || null,
        },
      ])

      if (insertError) {
        toast({ variant: "destructive", title: "保存エラー", description: "選択肢の保存に失敗しました" })
        return
      }

      toast({ title: "保存成功", description: "アカウント選択肢が保存されました" })
      router.push("/admin/questions")
    } catch (error) {
      console.error("保存エラー:", error)
      toast({ variant: "destructive", title: "エラー", description: "保存中にエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/admin/questions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">アカウント選択肢の上書き</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>選択肢内容の上書き</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="masterOptionId">対象マスター選択肢</Label>
              <Select value={masterOptionId} onValueChange={setMasterOptionId} required>
                <SelectTrigger id="masterOptionId">
                  <SelectValue placeholder="選択肢を選択" />
                </SelectTrigger>
                <SelectContent>
                  {masterOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      【{opt.question_title}】{opt.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">上書きテキスト（任意）</Label>
              <Input
                id="text"
                placeholder="テキストを上書きする場合入力"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">上書き画像URL（任意）</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  placeholder="画像URLを上書きする場合入力"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={() => setGalleryOpen(true)}>
                  ギャラリー
                </Button>
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">プレビュー:</p>
                  <img src={imageUrl} alt="選択画像" className="h-40 aspect-square  object-cover rounded-md" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/questions">キャンセル</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {account && (
        <ImageGalleryModal
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          onSelect={(imageId) => {
            supabase
              .from("images")
              .select("url")
              .eq("id", imageId)
              .single()
              .then(({ data }) => {
                if (data?.url) setImageUrl(data.url)
              })
          }}
          account={account}
        />
      )}
    </div>
  )
}
