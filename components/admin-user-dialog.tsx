"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface AdminUser {
  id: string
  email: string | null
  created_at: string
}

interface AdminUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminUser: AdminUser | null
  onSubmit: () => void
}

export function AdminUserDialog({ open, onOpenChange, adminUser, onSubmit }: AdminUserDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (adminUser) {
        // 編集モード
        setIsEdit(true)
        setEmail(adminUser.email || "")
        setPassword("")
      } else {
        // 新規作成モード
        setIsEdit(false)
        setEmail("")
        setPassword("")
      }
      setError(null)
    }
  }, [open, adminUser])

  const handleSubmit = async () => {
    try {
      if (!email) {
        setError("メールアドレスを入力してください")
        return
      }

      if (!isEdit && !password) {
        setError("パスワードを入力してください")
        return
      }

      setLoading(true)
      setError(null)

      if (isEdit && adminUser) {
        // 既存の管理者を更新
        if (adminUser.email !== email) {
          // メールアドレスが変更された場合は更新
          const { error: updateError } = await supabase
            .from("admin_users")
            .update({
              email,
            })
            .eq("id", adminUser.id)

          if (updateError) {
            console.error("管理者更新エラー:", updateError)
            setError("管理者の更新に失敗しました")
            return
          }
        }

        toast({
          title: "管理者を更新しました",
          description: "管理者情報が正常に更新されました",
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

        // 管理者として登録
        const { error: insertError } = await supabase.from("admin_users").insert({
          id: authData.user.id,
          email,
        })

        if (insertError) {
          console.error("管理者登録エラー:", insertError)
          setError("管理者の登録に失敗しました")
          return
        }

        toast({
          title: "管理者を作成しました",
          description: "管理者が正常に作成されました",
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
          <DialogTitle>{isEdit ? "管理者編集" : "新規管理者作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="管理者のメールアドレスを入力"
              required
            />
          </div>

          {!isEdit && (
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
          )}
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

