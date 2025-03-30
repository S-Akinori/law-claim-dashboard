"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface Trigger {
  id: string
  keyword: string
  question_id: string
  created_at: string
  question?: Question
}

interface TriggerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: Question[]
  trigger: Trigger | null
  onSubmit: () => void
}

export function TriggerDialog({ open, onOpenChange, questions, trigger, onSubmit }: TriggerDialogProps) {
  const [keyword, setKeyword] = useState("")
  const [questionId, setQuestionId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (trigger) {
        // 編集モード
        setIsEdit(true)
        setKeyword(trigger.keyword)
        setQuestionId(trigger.question_id)
      } else {
        // 新規作成モード
        setIsEdit(false)
        setKeyword("")
        setQuestionId("")
      }
      setError(null)
    }
  }, [open, trigger])

  const handleSubmit = async () => {
    try {
      if (!keyword || !questionId) {
        setError("すべての項目を入力してください")
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

      if (isEdit && trigger) {
        // 既存のトリガーを更新
        const { error: updateError } = await supabase
          .from("start_triggers")
          .update({
            keyword,
            question_id: questionId,
          })
          .eq("id", trigger.id)

        if (updateError) {
          console.error("トリガー更新エラー:", updateError)
          setError("トリガーの更新に失敗しました")
          return
        }

        toast({
          title: "トリガーを更新しました",
          description: "トリガーが正常に更新されました",
        })
      } else {
        // 新規トリガーを作成
        const { error: insertError } = await supabase.from("start_triggers").insert({
          account_id: accountData.id,
          keyword,
          question_id: questionId,
        })

        if (insertError) {
          console.error("トリガー作成エラー:", insertError)
          setError("トリガーの作成に失敗しました")
          return
        }

        toast({
          title: "トリガーを作成しました",
          description: "トリガーが正常に作成されました",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "トリガー編集" : "新規トリガー作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="keyword">キーワード</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="例: 慰謝料計算をする"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">開始質問</Label>
            <Select value={questionId} onValueChange={setQuestionId} required>
              <SelectTrigger id="question">
                <SelectValue placeholder="質問を選択" />
              </SelectTrigger>
              <SelectContent>
                {questions.map((question) => (
                  <SelectItem key={question.id} value={question.id}>
                    {question.title || question.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

