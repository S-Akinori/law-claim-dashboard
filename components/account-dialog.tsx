"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Account {
  id: string
  name: string
  user_id: string | null
  use_master: boolean
  created_at: string
}

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: Account | null
  onSubmit: () => void
}

export function AccountDialog({ open, onOpenChange, account, onSubmit }: AccountDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [useMaster, setUseMaster] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (account) {
        // 編集モード
        setIsEdit(true)
        setName(account.name)
        setUseMaster(account.use_master)
        setEmail("")
        setPassword("")
      } else {
        // 新規作成モード
        setIsEdit(false)
        setName("")
        setEmail("")
        setPassword("")
        setUseMaster(true)
      }
      setError(null)
    }
  }, [open, account])

  const handleSubmit = async () => {
    try {
      if (!name) {
        setError("アカウント名を入力してください")
        return
      }

      if (!isEdit && (!email || !password)) {
        setError("メールアドレスとパスワードを入力してください")
        return
      }

      setLoading(true)
      setError(null)

      if (isEdit && account) {
        // 既存のアカウントを更新
        const { error: updateError } = await supabase
          .from("accounts")
          .update({
            name,
            use_master: useMaster,
          })
          .eq("id", account.id)

        if (updateError) {
          console.error("アカウント更新エラー:", updateError)
          setError("アカウントの更新に失敗しました")
          return
        }

        toast({
          title: "アカウントを更新しました",
          description: "アカウントが正常に更新されました",
        })
      } else {
        // 新規ユーザーを作成
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError || !authData.user) {
          console.error("ユーザー作成エラー:", authError)
          setError(authError?.message || "ユーザーの作成に失敗しました")
          return
        }

        // 新規アカウントを作成
        const { error: insertError } = await supabase.from("accounts").insert({
          name,
          user_id: authData.user.id,
          use_master: useMaster,
        })

        if (insertError) {
          console.error("アカウント作成エラー:", insertError)
          setError("アカウントの作成に失敗しました")
          return
        }

        toast({
          title: "アカウントを作成しました",
          description: "アカウントが正常に作成されました",
        })
      }

      onSubmit()
    } catch (err) {
      console.error("保存エラー:", err)
      setError("保存中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "アカウント編集" : "新規アカウント作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">アカウント名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="アカウント名を入力"
              required
            />
          </div>

          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  required
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="useMaster" className="flex flex-col space-y-1">
              <span>マスターデータを使用する</span>
              <span className="font-normal text-sm text-muted-foreground">デフォルトのマスターデータを使用します</span>
            </Label>
            <Switch id="useMaster" checked={useMaster} onCheckedChange={setUseMaster} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (isEdit ? "更新中..." : "作成中...") : isEdit ? "更新" : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

