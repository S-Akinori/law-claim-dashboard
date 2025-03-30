"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { CopyIcon } from "lucide-react"

interface EmailTemplate {
  id: string
  subject: string
  body: string
  created_at: string
}

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface EmailTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
  onSubmit: () => void
}

export function EmailTemplateDialog({ open, onOpenChange, template, onSubmit }: EmailTemplateDialogProps) {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (template) {
        // 編集モード
        setIsEdit(true)
        setSubject(template.subject)
        setBody(template.body)
      } else {
        // 新規作成モード
        setIsEdit(false)
        setSubject("")
        setBody("")
      }
      setError(null)
      fetchQuestions()
    }
  }, [open, template])

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true)
      const { data, error } = await supabase
        .from("questions")
        .select("id, title, text, type")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("質問データ取得エラー:", error)
        return
      }

      setQuestions(data || [])
    } catch (err) {
      console.error("質問データ取得エラー:", err)
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleCopyQuestionId = (id: string) => {
    navigator.clipboard.writeText(`{answer:${id}}`)
    toast({
      title: "コピーしました",
      description: "質問IDをコピーしました。テンプレートに貼り付けてください。",
    })
  }

  const handleSubmit = async () => {
    try {
      if (!subject || !body) {
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

      if (isEdit && template) {
        // 既存のテンプレートを更新
        const { error: updateError } = await supabase
          .from("email_templates")
          .update({
            subject,
            body,
          })
          .eq("id", template.id)

        if (updateError) {
          console.error("テンプレート更新エラー:", updateError)
          setError("テンプレートの更新に失敗しました")
          return
        }

        toast({
          title: "テンプレートを更新しました",
          description: "テンプレートが正常に更新されました",
        })
      } else {
        // 新規テンプレートを作成
        const { error: insertError } = await supabase.from("email_templates").insert({
          account_id: accountData.id,
          subject,
          body,
        })

        if (insertError) {
          console.error("テンプレート作成エラー:", insertError)
          setError("テンプレートの作成に失敗しました")
          return
        }

        toast({
          title: "テンプレートを作成しました",
          description: "テンプレートが正常に作成されました",
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "テンプレート編集" : "新規テンプレート作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="subject">件名</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="メールの件名"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">本文</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="メールの本文"
              rows={10}
              required
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">以下のプレースホルダーを使用できます：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{"{name}"} - ユーザー名</li>
                <li>{"{email}"} - ユーザーのメールアドレス</li>
                <li>{"{answers}"} - ユーザーの回答一覧</li>
                <li>{"{answer:質問ID}"} - 特定の質問に対するユーザーの回答</li>
              </ul>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="questions">
              <AccordionTrigger>利用可能な質問一覧</AccordionTrigger>
              <AccordionContent>
                {loadingQuestions ? (
                  <div className="py-2 text-sm text-muted-foreground">質問を読み込み中...</div>
                ) : questions.length === 0 ? (
                  <div className="py-2 text-sm text-muted-foreground">質問がありません</div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {questions.map((question) => (
                      <div key={question.id} className="border rounded-md p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{question.title || question.text}</p>
                            {question.title && <p className="text-muted-foreground mt-1">{question.text}</p>}
                            <p className="text-xs text-muted-foreground mt-1">タイプ: {question.type}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyQuestionId(question.id)}
                            className="h-8 px-2"
                          >
                            <CopyIcon className="h-4 w-4 mr-1" />
                            IDをコピー
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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

