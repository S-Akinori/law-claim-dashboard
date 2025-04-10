"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface ScheduledMessage {
  id: string
  day_offset: number
  hour: number
  message: string
  created_at: string
}

interface ScheduledMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: ScheduledMessage | null
  onSubmit: () => void
}

export function ScheduledMessageDialog({ open, onOpenChange, message, onSubmit }: ScheduledMessageDialogProps) {
  const [dayOffset, setDayOffset] = useState<number>(1)
  const [hour, setHour] = useState<number>(9)
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (message) {
        // 編集モード
        setIsEdit(true)
        setDayOffset(message.day_offset)
        setHour(message.hour)
        setMessageText(message.message)
      } else {
        // 新規作成モード
        setIsEdit(false)
        setDayOffset(1)
        setHour(9)
        setMessageText("")
      }
      setError(null)
    }
  }, [open, message])

  const handleSubmit = async () => {
    try {
      if (!messageText) {
        setError("メッセージを入力してください")
        return
      }

      setLoading(true)
      setError(null)

      
      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("ユーザー情報取得エラー:", userError)
        setError("ユーザー情報の取得に失敗しました")
        return
      }

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("id").eq('user_id', userData.user.id).single()

      if (accountError || !accountData) {
        console.error("アカウント情報取得エラー:", accountError)
        setError("アカウント情報の取得に失敗しました")
        return
      }

      if (isEdit && message) {
        // 既存のメッセージを更新
        const { error: updateError } = await supabase
          .from("master_scheduled_messages")
          .update({
            day_offset: dayOffset,
            hour: hour,
            message: messageText,
          })
          .eq("id", message.id)

        if (updateError) {
          console.error("メッセージ更新エラー:", updateError)
          setError("メッセージの更新に失敗しました")
          return
        }

        toast({
          title: "メッセージを更新しました",
          description: "定期メッセージが正常に更新されました",
        })
      } else {
        // 新規メッセージを作成
        const { error: insertError } = await supabase.from("master_scheduled_messages").insert({
          day_offset: dayOffset,
          hour: hour,
          message: messageText,
        })

        if (insertError) {
          console.error("メッセージ作成エラー:", insertError)
          setError("メッセージの作成に失敗しました")
          return
        }

        toast({
          title: "メッセージを作成しました",
          description: "定期メッセージが正常に作成されました",
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

  // 時間選択用の配列を生成（0-23時）
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "定期メッセージ編集" : "新規定期メッセージ作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="dayOffset">送信タイミング（登録からの日数）</Label>
            <div className="flex items-center gap-2">
              <Input
                id="dayOffset"
                type="number"
                min="1"
                value={dayOffset}
                onChange={(e) => setDayOffset(Number.parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <span>日後</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hour">送信時間</Label>
            <Select value={hour.toString()} onValueChange={(value) => setHour(Number.parseInt(value))}>
              <SelectTrigger id="hour" className="w-full">
                <SelectValue placeholder="送信時間を選択" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((h) => (
                  <SelectItem key={h} value={h.toString()}>
                    {h.toString().padStart(2, "0")}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">メッセージ内容</Label>
            <Textarea
              id="message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="送信するメッセージを入力してください"
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              ※ このメッセージは、ユーザーが最後の質問に到達していない場合にのみ送信されます。
            </p>
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

