"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid" // UUIDを生成するライブラリを追加する必要があります

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface Option {
  id: string
  master_question_id: string
  text: string
}

interface Condition {
  id?: string
  master_question_id: string
  required_master_question_id: string
  required_master_option_id: string | null
  operator: string
  value: string | null
  condition_group: string
  isNew?: boolean
  isDeleted?: boolean
}

interface QuestionRoute {
  id: string
  from_master_question_id: string
  next_master_question_id: string
  condition_group: string
  conditions?: Condition[]
}

interface QuestionRouteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: Question[]
  options: { [key: string]: Option[] }
  route: QuestionRoute | null
  onSubmit: () => void
}

export function MasterQuestionRouteDialog({
  open,
  onOpenChange,
  questions,
  options,
  route,
  onSubmit,
}: QuestionRouteDialogProps) {
  const [fromQuestionId, setFromQuestionId] = useState<string>("")
  const [nextQuestionId, setNextQuestionId] = useState<string>("")
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [conditionGroup, setConditionGroup] = useState<string>("")
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (route) {
        // 編集モード
        setIsEdit(true)
        setFromQuestionId(route.from_master_question_id)
        setNextQuestionId(route.next_master_question_id)
        setConditionGroup(route.condition_group)
        setConditions(route.conditions || [])
      } else {
        // 新規作成モード
        setIsEdit(false)
        setFromQuestionId("")
        setNextQuestionId("")
        setConditionGroup(uuidv4()) // 新しい条件グループIDを生成
        setConditions([])
      }
      setError(null)
    }
  }, [open, route])

  const handleAddCondition = () => {
    if (!fromQuestionId) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "最初に質問を選択してください",
      })
      return
    }

    const newCondition: Condition = {
      master_question_id: fromQuestionId,
      required_master_question_id: "",
      required_master_option_id: null,
      operator: "=",
      value: "",
      condition_group: conditionGroup,
      isNew: true,
    }

    setConditions([...conditions, newCondition])
  }

  const handleRemoveCondition = (index: number) => {
    const newConditions = [...conditions]

    if (newConditions[index].id) {
      // 既存の条件の場合は削除フラグを立てる
      newConditions[index].isDeleted = true
    } else {
      // 新規の条件の場合は配列から削除
      newConditions.splice(index, 1)
    }

    setConditions(newConditions)
  }

  const handleConditionChange = (
    index: number,
    field: "required_master_question_id" | "required_master_option_id" | "operator" | "value",
    value: string | null,
  ) => {
    const newConditions = [...conditions]
    newConditions[index][field] = value

    // 質問が変更された場合、選択肢とオペレータをリセット
    if (field === "required_master_question_id") {
      newConditions[index].required_master_option_id = null
      // 選択肢がある質問タイプの場合はオペレータをセット
      const selectedQuestion = questions.find((q) => q.id === value)
      if (selectedQuestion && (selectedQuestion.type === "button" || selectedQuestion.type === "image_carousel")) {
        newConditions[index].operator = "="
      }
    }

    setConditions(newConditions)
  }

  const handleSubmit = async () => {
    try {
      if (!fromQuestionId || !nextQuestionId) {
        setError("質問を選択してください")
        return
      }

      setLoading(true)
      setError(null)

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

      if (isEdit && route) {
        // 既存のルートを更新
        const { error: updateRouteError } = await supabase
          .from("master_question_routes")
          .update({
            from_master_question_id: fromQuestionId,
            next_master_question_id: nextQuestionId,
          })
          .eq("id", route.id)

        if (updateRouteError) {
          console.error("ルート更新エラー:", updateRouteError)
          setError("ルートの更新に失敗しました")
          return
        }

        // 条件を処理
        // 1. 削除される条件を削除
        const conditionsToDelete = conditions.filter((c) => c.isDeleted && c.id)
        for (const condition of conditionsToDelete) {
          const { error: deleteError } = await supabase.from("master_conditions").delete().eq("id", condition.id)

          if (deleteError) {
            console.error("条件削除エラー:", deleteError)
            setError("条件の削除に失敗しました")
            return
          }
        }

        // 2. 既存の条件を更新
        const conditionsToUpdate = conditions.filter((c) => c.id && !c.isNew && !c.isDeleted)
        for (const condition of conditionsToUpdate) {
          const { error: updateError } = await supabase
            .from("master_conditions")
            .update({
              required_master_question_id: condition.required_master_question_id,
              required_master_option_id: condition.required_master_option_id,
              operator: condition.operator,
              value: condition.value,
            })
            .eq("id", condition.id)

          if (updateError) {
            console.error("条件更新エラー:", updateError)
            setError("条件の更新に失敗しました")
            return
          }
        }

        // 3. 新しい条件を追加
        const conditionsToAdd = conditions.filter((c) => c.isNew && !c.isDeleted)
        if (conditionsToAdd.length > 0) {
          const conditionsToInsert = conditionsToAdd.map((condition) => ({
            master_question_id: fromQuestionId,
            required_master_question_id: condition.required_master_question_id,
            required_master_option_id: condition.required_master_option_id,
            operator: condition.operator,
            value: condition.value,
            condition_group: conditionGroup,
          }))

          const { error: insertError } = await supabase.from("master_conditions").insert(conditionsToInsert)

          if (insertError) {
            console.error("条件追加エラー:", insertError)
            setError("条件の追加に失敗しました")
            return
          }
        }
      } else {
        // 新規ルートを作成
        const { data: newRoute, error: insertRouteError } = await supabase
          .from("master_question_routes")
          .insert({
            from_master_question_id: fromQuestionId,
            next_master_question_id: nextQuestionId,
            condition_group: conditionGroup,
          })
          .select()
          .single()

        if (insertRouteError || !newRoute) {
          console.error("ルート作成エラー:", insertRouteError)
          setError("ルートの作成に失敗しました")
          return
        }

        // 条件を追加
        const validConditions = conditions.filter(
          (condition) => condition.required_master_question_id && (condition.required_master_option_id || condition.operator),
        )

        if (validConditions.length > 0) {
          const conditionsToInsert = validConditions.map((condition) => ({
            master_question_id: fromQuestionId,
            required_master_question_id: condition.required_master_question_id,
            required_master_option_id: condition.required_master_option_id,
            operator: condition.operator,
            value: condition.value,
            condition_group: conditionGroup,
          }))

          const { error: insertConditionError } = await supabase.from("master_conditions").insert(conditionsToInsert)

          if (insertConditionError) {
            console.error("条件作成エラー:", insertConditionError)
            setError("条件の作成に失敗しました")
            return
          }
        }
      }

      toast({
        title: isEdit ? "ルートを更新しました" : "ルートを作成しました",
        description: "ルートが正常に保存されました",
      })

      onSubmit()
    } catch (err) {
      console.error("保存エラー:", err)
      setError("保存中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const getQuestionType = (questionId: string): string => {
    const question = questions.find((q) => q.id === questionId)
    return question ? question.type : ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "ルート編集" : "新規ルート作成"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fromQuestion">質問元</Label>
              <Select
                value={fromQuestionId}
                onValueChange={setFromQuestionId}
                disabled={isEdit} // 編集時は変更不可
              >
                <SelectTrigger id="fromQuestion">
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

            <div className="space-y-2">
              <Label htmlFor="nextQuestion">次の質問</Label>
              <Select value={nextQuestionId} onValueChange={setNextQuestionId}>
                <SelectTrigger id="nextQuestion">
                  <SelectValue placeholder="質問を選択" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {questions.map((question) => (
                    <SelectItem key={question.id} value={question.id}>
                      {question.title || question.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>条件設定</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  disabled={!fromQuestionId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  条件を追加
                </Button>
              </div>

              {conditions.length === 0 || conditions.every((c) => c.isDeleted) ? (
                <div className="text-center py-4 text-muted-foreground border rounded-md">
                  条件がありません。条件なしの場合は常に次の質問に遷移します。
                </div>
              ) : (
                <div className="space-y-4">
                  {conditions.map(
                    (condition, index) =>
                      !condition.isDeleted && (
                        <div key={condition.id || index} className="space-y-3 border p-4 rounded-md">
                          <div className="flex items-center justify-between">
                            <Label>条件 {index + 1}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCondition(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`requiredQuestion-${index}`}>対象質問</Label>
                              <Select
                                value={condition.required_master_question_id}
                                onValueChange={(value) => handleConditionChange(index, "required_master_question_id", value)}
                              >
                                <SelectTrigger id={`requiredQuestion-${index}`}>
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

                            {condition.required_master_question_id && (
                              <>
                                {getQuestionType(condition.required_master_question_id) === "button" ||
                                getQuestionType(condition.required_master_question_id) === "image_carousel" ? (
                                  // ボタンや画像カルーセルの場合は選択肢から選ぶ
                                  <div>
                                    <Label htmlFor={`requiredOption-${index}`}>選択肢</Label>
                                    <Select
                                      value={condition.required_master_option_id || undefined}
                                      onValueChange={(value) =>
                                        handleConditionChange(index, "required_master_option_id", value)
                                      }
                                    >
                                      <SelectTrigger id={`requiredOption-${index}`}>
                                        <SelectValue placeholder="選択肢を選択" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {options[condition.required_master_question_id]?.map((option) => (
                                          <SelectItem key={option.id} value={option.id}>
                                            {option.text}
                                          </SelectItem>
                                        )) || (
                                          <SelectItem value="" disabled>
                                            選択肢がありません
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ) : (
                                  // テキスト入力の場合は比較演算子と値を入力
                                  <>
                                    <div>
                                      <Label htmlFor={`operator-${index}`}>演算子</Label>
                                      <Select
                                        value={condition.operator}
                                        onValueChange={(value) => handleConditionChange(index, "operator", value)}
                                      >
                                        <SelectTrigger id={`operator-${index}`}>
                                          <SelectValue placeholder="演算子を選択" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="=">=（等しい）</SelectItem>
                                          <SelectItem value="!=">≠（等しくない）</SelectItem>
                                          <SelectItem value=">">＞（より大きい）</SelectItem>
                                          <SelectItem value=">=">≧（以上）</SelectItem>
                                          <SelectItem value="<">＜（より小さい）</SelectItem>
                                          <SelectItem value="<=">≦（以下）</SelectItem>
                                          <SelectItem value="LIKE">含む</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor={`value-${index}`}>値</Label>
                                      <Input
                                        id={`value-${index}`}
                                        value={condition.value || ""}
                                        onChange={(e) => handleConditionChange(index, "value", e.target.value)}
                                        placeholder="比較する値を入力"
                                      />
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>
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

