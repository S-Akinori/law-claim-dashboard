"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Props {
  masterQuestionId: string
  initialType: string
  initialConfig: any
}

export default function QuestionBehaviorForm({ masterQuestionId, initialType, initialConfig }: Props) {
  const [type, setType] = useState(initialType)
  const [message, setMessage] = useState(initialConfig.message || "")
  const [imageUrl, setImageUrl] = useState(initialConfig.image_url || "")
  const [formula, setFormula] = useState(initialConfig.formula || "")
  const [storeAs, setStoreAs] = useState(initialConfig.store_as || "")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  const handleSave = async () => {
    setLoading(true)

    const config: any = {}
    if (type === "result_display") {
      config.message = message
      config.image_url = imageUrl
    } else if (type === "calculate") {
      config.formula = formula
      config.store_as = storeAs
    }

    const { error } = await supabase.from("master_question_behaviors").upsert({
      next_master_question_id: masterQuestionId,
      type,
      config,
    })

    if (error) {
      toast({
        variant: "destructive",
        title: "保存に失敗しました",
        description: error.message,
      })
    } else {
      toast({ title: "保存しました" })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>アクションタイプ</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="result_display">結果を表示</SelectItem>
            <SelectItem value="calculate">スコアを計算</SelectItem>
            <SelectItem value="end">終了</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "result_display" && (
        <>
          <div>
            <Label>表示メッセージ</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div>
            <Label>画像URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
        </>
      )}

      {type === "calculate" && (
        <>
          <div>
            <Label>計算式</Label>
            <Input
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="例: (q1 + q2) / 2"
            />
          </div>
          <div>
            <Label>変数名（保存先）</Label>
            <Input
              value={storeAs}
              onChange={(e) => setStoreAs(e.target.value)}
              placeholder="例: score"
            />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  )
}
