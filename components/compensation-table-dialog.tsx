"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface CompensationTable {
  id: string
  account_id: string
  name: string
  table_name: string
  description: string | null
  created_at: string
}

interface CompensationTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: CompensationTable | null
  onSubmit: () => void
}

export function CompensationTableDialog({ open, onOpenChange, table, onSubmit }: CompensationTableDialogProps) {
  const [name, setName] = useState("")
  const [tableName, setTableName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (table) {
        // 編集モード
        setIsEdit(true)
        setName(table.name)
        setTableName(table.table_name)
        setDescription(table.description || "")
      } else {
        // 新規作成モード
        setIsEdit(false)
        setName("")
        setTableName("")
        setDescription("")
      }
      setError(null)
    }
  }, [open, table])

  const handleSubmit = async () => {
    try {
      if (!name || !tableName) {
        setError("テーブル名とテーブルIDを入力してください")
        return
      }

      setLoading(true)
      setError(null)

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("id").single()

      if (accountError || !accountData) {
        console.error("アカウント情報取得エラー:", accountError)
        setError("アカウント情報の取得に失敗しました")
        return
      }

      if (isEdit && table) {
        // 既存のテーブルを更新
        const { error: updateError } = await supabase
          .from("compensation_tables")
          .update({
            name,
            table_name: tableName,
            description: description || null,
          })
          .eq("id", table.id)

        if (updateError) {
          console.error("テーブル更新エラー:", updateError)
          setError("テーブルの更新に失敗しました")
          return
        }

        toast({
          title: "テーブルを更新しました",
          description: "慰謝料テーブルが正常に更新されました",
        })
      } else {
        // 新規テーブルを作成
        const { error: insertError } = await supabase.from("compensation_tables").insert({
          account_id: accountData.id,
          name,
          table_name: tableName,
          description: description || null,
        })

        if (insertError) {
          console.error("テーブル作成エラー:", insertError)
          setError("テーブルの作成に失敗しました")
          return
        }

        toast({
          title: "テーブルを作成しました",
          description: "慰謝料テーブルが正常に作成されました",
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
          <DialogTitle>{isEdit ? "慰謝料テーブル編集" : "新規慰謝料テーブル作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">テーブル名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 軽傷慰謝料表、後遺障害8級"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tableName">テーブルID</Label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="例: light_injury_compensation"
              required
            />
            <p className="text-xs text-muted-foreground">Supabaseに存在する金額マスターテーブル名を指定してください</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="テーブルの説明を入力してください"
              rows={3}
            />
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

