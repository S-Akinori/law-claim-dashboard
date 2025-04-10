"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

interface ImageOption {
  url: string
  caption?: string
}

interface MasterQuestion {
  id: string
  text: string
  type: string
  title: string
  created_at: string
}

interface MasterQuestionDetailProps {
  questionId: string
}

export function MasterQuestionDetail({ questionId }: MasterQuestionDetailProps) {
  const [question, setQuestion] = useState<MasterQuestion | null>(null)
  const [imageOptions, setImageOptions] = useState<ImageOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchQuestionDetail()
  }, [questionId])

  const fetchQuestionDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("master_questions").select("*").eq("id", questionId).single()

      if (error) {
        console.error("質問取得エラー:", error)
        setError("質問の取得に失敗しました")
        return
      }

      setQuestion(data)

      // 画像カルーセルの場合、画像オプションを解析
      if (data.type === "image_carousel") {
        try {
          const parsedOptions = JSON.parse(data.text)
          if (Array.isArray(parsedOptions)) {
            setImageOptions(parsedOptions)
          } else {
            setImageOptions([])
          }
        } catch (e) {
          console.error("画像オプション解析エラー:", e)
          setImageOptions([])
        }
      }
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return <Badge variant="outline">テキスト</Badge>
      case "image_carousel":
        return <Badge variant="outline">画像カルーセル</Badge>
      case "button":
        return <Badge variant="outline">ボタン</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (error || !question) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "質問が見つかりませんでした"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{question.title}</CardTitle>
            {getTypeLabel(question.type)}
          </div>
          <CardDescription>作成日時: {formatDate(question.created_at)}</CardDescription>
        </CardHeader>
        <CardContent>
          {question.type === "image_carousel" ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">画像カルーセル選択肢</h3>
              {imageOptions.length === 0 ? (
                <p className="text-muted-foreground">画像が設定されていません</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageOptions.map((option, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="aspect-square relative mb-2 bg-muted rounded-md overflow-hidden">
                          {option.url ? (
                            <div className="w-full h-full relative">
                              <img
                                src={option.url || "/placeholder.svg"}
                                alt={option.caption || `画像 ${index + 1}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMgNEg2QzUuNDQ3NzIgNCA1IDQuNDQ3NzIgNSA1VjE5QzUgMTkuNTUyMyA1LjQ0NzcyIDIwIDYgMjBIMThDMTguNTUyMyAyMCAxOSAxOS41NTIzIDE5IDE5VjEwTTEzIDRMMTkgMTBNMTMgNFYxMEgxOU0xNyAxNEgxMU0xNCAxN1YxMSIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=="
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <span className="text-muted-foreground">画像なし</span>
                            </div>
                          )}
                        </div>
                        {option.caption && <p className="text-sm text-center">{option.caption}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium mb-2">質問内容</h3>
              <p>{question.text}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

