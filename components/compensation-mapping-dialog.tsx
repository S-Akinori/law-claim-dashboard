"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface Mapping {
  id: string
  compensation_table_id: string
  kind: string
  question_id: string
  created_at: string
  question?: Question
}

interface CompensationMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapping: Mapping | null
  tableId: string
  questions: Question[]
  onSubmit: () => void
}

export function CompensationMappingDialog({
  open,
  onOpenChange,
  mapping,
  tableId,
  questions,
  onSubmit,
}: CompensationMappingDialogProps) {
  const [kind, setKind] = useState<string>("")
  const [questionId, setQuestionId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (mapping) {
        // 編集モード
        setIsEdit(true)
        setKind(mapping.kind)
        setQuestionId(mapping.question_id)
      } else {
        // 新規作成モード
        setIsEdit(false)
        setKind("")
        setQuestionId("")
      }
      setError(null)
    }
  }, [open, mapping])

  const handleSubmit = async () => {
    try {
      if (!kind || !questionId) {
        setError("すべての項目を入力してください")
        return
      }

      setLoading(true)
      setError(null)

      if (isEdit && mapping) {
        // 既存のマッピングを更新
        const { error: updateError } = await supabase
          .from("compensation_input_mapping")
          .update({
            kind,
            question_id: questionId,
          })
          .eq("id", mapping.id)

        if (updateError) {
          console.error("マッピング更新エラー:", updateError)
          setError("マッピングの更新に失敗しました")
          return
        }

        toast({
          title: "マッピングを更新しました",
          description: "マッピングが正常に更新されました",
        })
      } else {
        // 新規マッピングを作成
        const { error: insertError } = await supabase.from("compensation_input_mapping").insert({
          compensation_table_id: tableId,
          kind,
          question_id: questionId,
        })

        if (insertError) {
          console.error("マッピング作成エラー:", insertError)
          setError("マッピングの作成に失敗しました")
          return
        }

        toast({
          title: "マッピングを作成しました",
          description: "マッピングが正常に作成されました",
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

  // 入力種類の選択肢
  const kindOptions = [
    { value: "hospitalization_months", label: "入院月数" },
    { value: "outpatient_months", label: "通院月数" },
    { value: "grade", label: "等級" },
    { value: "age", label: "年齢" },
    { value: "injury_type", label: "怪我の種類" },
    { value: "severity", label: "重症度" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "マッピング編集" : "新規マッピング作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="kind">入力種類</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger id="kind">
                <SelectValue placeholder="入力種類を選択" />
              </SelectTrigger>
              <SelectContent>
                {kindOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">慰謝料計算に必要な入力項目の種類を選択してください</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">質問</Label>
            <Select value={questionId} onValueChange={setQuestionId}>
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
            <p className="text-xs text-muted-foreground">この入力項目に対応する質問を選択してください</p>
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

