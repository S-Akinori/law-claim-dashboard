"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown } from "lucide-react"

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface QuestionRoute {
  id: string
  from_question_id: string
  next_question_id: string
  condition_group: string
  conditions?: Condition[]
  from_question?: Question
  next_question?: Question
}

interface Condition {
  id: string
  question_id: string
  required_question_id: string
  required_option_id: string | null
  operator: string
  value: string | null
  condition_group: string
  required_question?: Question
  required_option?: Option
}

interface Option {
  id: string
  question_id: string
  text: string
}

interface QuestionNode {
  id: string
  question: Question
  children: QuestionNodeWithConditions[]
}

interface QuestionNodeWithConditions {
  id: string
  question: Question
  conditions: Condition[]
}

interface QuestionFlowChartProps {
  questions: Question[]
  routes: QuestionRoute[]
}

export function QuestionFlowChart({ questions, routes }: QuestionFlowChartProps) {
  const [startQuestions, setStartQuestions] = useState<Question[]>([])
  const [flow, setFlow] = useState<QuestionNode[]>([])

  useEffect(() => {
    // 開始質問（他の質問からの参照がない質問）を見つける
    const targetQuestionIds = routes.map((route) => route.next_question_id)
    const potentialStartQuestions = questions.filter((question) => !targetQuestionIds.includes(question.id))
    setStartQuestions(potentialStartQuestions)

    // フローを構築
    const buildFlow = () => {
      // 最初の質問ごとにフローを構築
      return potentialStartQuestions.map((startQuestion) => {
        return buildQuestionNode(startQuestion)
      })
    }

    setFlow(buildFlow())
  }, [questions, routes])

  // 再帰的に質問ノードを構築
  const buildQuestionNode = (question: Question, visited: Set<string> = new Set()): QuestionNode => {
    // 循環参照防止
    if (visited.has(question.id)) {
      return { id: question.id, question, children: [] }
    }

    // 訪問済みに追加
    const newVisited = new Set(visited)
    newVisited.add(question.id)

    // この質問からの遷移先を見つける
    const outgoingRoutes = routes.filter((route) => route.from_question_id === question.id)

    // 子ノードを構築
    const children = outgoingRoutes
      .map((route) => {
        const nextQuestion = questions.find((q) => q.id === route.next_question_id)
        if (!nextQuestion) return null

        return {
          id: route.id,
          question: nextQuestion,
          conditions: route.conditions || [],
        }
      })
      .filter(Boolean) as QuestionNodeWithConditions[]

    return {
      id: question.id,
      question,
      children,
    }
  }

  // 条件の説明を生成
  const getConditionDescription = (condition: Condition): string => {
    let description = `「${condition.required_question?.title || "不明な質問"}」が `

    if (condition.required_option_id) {
      description += `「${condition.required_option?.text || "不明な選択肢"}」を選択した場合`
    } else {
      const operatorMap: { [key: string]: string } = {
        "=": "=",
        "!=": "≠",
        ">": ">",
        ">=": "≥",
        "<": "<",
        "<=": "≤",
        LIKE: "を含む",
      }

      description += `${operatorMap[condition.operator] || condition.operator} ${condition.value || ""}`
    }

    return description
  }

  // 質問ノードを再帰的にレンダリング
  const renderQuestionNode = (node: QuestionNode, level = 0) => {
    return (
      <div key={node.id} className="mb-4 ml-4">
        <div className="rounded-md border bg-card p-3 shadow-sm">
          <div className="font-medium">{node.question.title || node.question.text}</div>
          <div className="text-xs text-muted-foreground">タイプ: {node.question.type}</div>
        </div>

        {node.children.length > 0 && (
          <div className="ml-8 mt-2 space-y-4">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                <div className="absolute left-[-1rem] top-0 bottom-0 border-l-2 border-dashed border-muted-foreground" />
                <div className="flex items-center mb-2">
                  <ArrowDown className="h-4 w-4 mr-2 text-muted-foreground" />
                  {child.conditions && child.conditions.length > 0 ? (
                    <div className="text-xs bg-muted p-1 rounded">
                      {child.conditions.map((condition, i) => (
                        <div key={condition.id}>
                          {i > 0 && <span className="mx-1">かつ</span>}
                          {getConditionDescription(condition)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">条件なし（常に遷移）</div>
                  )}
                </div>
                <div className="rounded-md border bg-card p-3 shadow-sm">
                  <div className="font-medium">{child.question.title || child.question.text}</div>
                  <div className="text-xs text-muted-foreground">タイプ: {child.question.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>質問フロー</CardTitle>
        <CardDescription>質問の流れを可視化します</CardDescription>
      </CardHeader>
      <CardContent>
        {startQuestions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            開始質問が見つかりません。質問ルートを設定してください。
          </div>
        ) : (
          <div className="space-y-4">{flow.map((node) => renderQuestionNode(node))}</div>
        )}
      </CardContent>
    </Card>
  )
}

