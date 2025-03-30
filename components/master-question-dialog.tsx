"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface MasterQuestion {
  id: string
  text: string
  options: string[]
  order: number
  created_at: string
}

interface MasterQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: MasterQuestion | null
  onSubmit: () => void
}

export function MasterQuestionDialog({ open, onOpenChange, question, onSubmit }: MasterQuestionDialogProps) {
  const [text, setText] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [optionsText, setOptionsText] = useState("")
  const [order, setOrder] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (question) {
        // 編集モード
        setIsEdit(true)
        setText(question.text)
        setOptions(question.options || [])
        setOptionsText(question.options ? question.options.join("\n") : "")
        setOrder(question.order)
      } else {
        // 新規作成モード
        setIsEdit(false)
        setText("")
        setOptions([])
        setOptionsText("")
        // 最大の順序番号 + 1 を設定
        supabase
          .from("master_questions")
          .select("order")
          .order("order", { ascending: false })
          .limit(1)
          .then(({ data }) => {
            if (data && data.length > 0) {
              setOrder(data[0].order + 1)
            } else {
              setOrder(1)
            }
          })
      }
      setError(null)
    }
  }, [open, question, supabase])

  const handleSubmit = async () => {
    try {
      if (!text) {
        setError("質問内容を入力してください")
        return
      }

      setLoading(true)
      setError(null)

      // 選択肢を配列に変換
      const optionsArray = optionsText
        .split("\n")
        .map((option) => option.trim())
        .filter((option) => option !== "")

      if (isEdit && question) {
        // 既存の質問を更新
        const { error: updateError } = await supabase
          .from("master_questions")
          .update({
            text: text,
            options: optionsArray.length > 0 ? optionsArray : null,
            order: order,
          })
          .eq("id", question.id)

        if (updateError) {
          console.error("質問更新エラー:", updateError)
          setError("質問の更新に失敗しました")
          return
        }

        toast({
          title: "質問を更新しました",
          description: "マスター質問が正常に更新されました",
        })
      } else {
        // 新規質問を作成
        const { error: insertError } = await supabase.from("master_questions").insert({
          text: text,
          options: optionsArray.length > 0 ? optionsArray : null,
          order: order,
        })

        if (insertError) {
          console.error("質問作成エラー:", insertError)
          setError("質問の作成に失敗しました")
          return
        }

        toast({
          title: "質問を作成しました",
          description: "マスター質問が正常に作成されました",
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
          <DialogTitle>{isEdit ? "マスター質問編集" : "新規マスター質問作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="order">表示順序</Label>
            <Input
              id="order"
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(Number.parseInt(e.target.value) || 1)}
              className="w-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">質問内容</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="質問内容を入力してください"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="options">選択肢（1行に1つ、空欄の場合は自由回答）</Label>
            <Textarea
              id="options"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              placeholder="選択肢を1行に1つ入力してください
例：はい
例：いいえ"
              rows={5}
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

