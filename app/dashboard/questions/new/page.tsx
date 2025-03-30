"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Upload, ImageIcon } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ImageGalleryModal } from "@/components/image-gallery-modal"

// Optionインターフェースを追加
interface Option {
  text: string
  image_url?: string
}

export default function NewQuestionPage() {
  const [questionTitle, setQuestionTitle] = useState("")
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState("text")
  // 既存のstateを修正
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // 画像ギャラリーモーダルの状態
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number | null>(null)

  // handleAddOptionを修正
  const handleAddOption = () => {
    setOptions([...options, { text: "" }])
  }

  // handleOptionChangeを修正して画像URLも扱えるようにする
  const handleOptionChange = (index: number, field: "text" | "image_url", value: string) => {
    const newOptions = [...options]
    newOptions[index][field] = value
    setOptions(newOptions)
  }

  // 選択肢削除関数
  const handleRemoveOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  // 画像アップロード処理を更新
  const handleImageUpload = async (index: number, file: File) => {
    try {
      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("ユーザー情報取得エラー:", userError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "ユーザー情報の取得に失敗しました",
        })
        return
      }

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("id").single()

      if (accountError || !accountData) {
        console.error("アカウント情報取得エラー:", accountError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "アカウント情報の取得に失敗しました",
        })
        return
      }

      const userId = userData.user.id
      const accountId = accountData.id

      // ファイル名を一意にするために現在時刻とランダム文字列を追加
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${userId}/${accountId}/${fileName}`

      // Supabaseストレージにアップロード
      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) {
        console.error("画像アップロードエラー:", uploadError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "画像のアップロードに失敗しました",
        })
        return
      }

      // 公開URLを取得
      const { data: publicURL } = supabase.storage.from("images").getPublicUrl(filePath)

      // imagesテーブルにデータを挿入
      const { data: imageData, error: insertError } = await supabase
        .from("images")
        .insert([
          {
            account_id: accountId,
            url: publicURL.publicUrl,
            description: file.name, // 初期説明としてファイル名を使用
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error("画像データ挿入エラー:", insertError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "画像データの保存に失敗しました",
        })
      }

      // 選択肢の画像URLを更新
      const newOptions = [...options]
      newOptions[index].image_url = publicURL.publicUrl
      setOptions(newOptions)

      toast({
        title: "画像をアップロードしました",
        description: "画像が正常にアップロードされました",
      })
    } catch (err) {
      console.error("画像アップロードエラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "画像のアップロード中にエラーが発生しました",
      })
    }
  }

  // ギャラリーから画像を選択する処理
  const handleOpenGallery = (index: number) => {
    setCurrentOptionIndex(index)
    setGalleryOpen(true)
  }

  // ギャラリーで選択した画像を設定する処理
  const handleSelectImage = (imageUrl: string) => {
    if (currentOptionIndex !== null) {
      const newOptions = [...options]
      newOptions[currentOptionIndex].image_url = imageUrl
      setOptions(newOptions)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // アカウントIDを取得
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          variant: "destructive",
          title: "認証エラー",
          description: "ログインしていません",
        })
        return
      }

      const { data: accountData, error: accountError } = await supabase.from("accounts").select("id").single()

      if (accountError || !accountData) {
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "アカウント情報の取得に失敗しました",
        })
        return
      }

      // 質問を作成
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert([
          {
            account_id: accountData.id,
            title: questionTitle,
            text: questionText,
            type: questionType,
          },
        ])
        .select()

      if (questionError || !questionData) {
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "質問の作成に失敗しました",
        })
        return
      }

      // handleSubmitメソッド内の選択肢追加部分を修正
      // 選択肢がある場合は追加
      if (options.length > 0) {
        const optionsToInsert = options.map((option) => ({
          question_id: questionData[0].id,
          text: option.text,
          image_url: option.image_url || null,
        }))

        const { error: optionsError } = await supabase.from("options").insert(optionsToInsert)

        if (optionsError) {
          toast({
            variant: "destructive",
            title: "エラーが発生しました",
            description: "選択肢の作成に失敗しました",
          })
          return
        }
      }

      toast({
        title: "質問を作成しました",
        description: "質問が正常に作成されました",
      })

      router.push("/dashboard/questions")
    } catch (error) {
      console.error("質問作成エラー:", error)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "質問の作成中にエラーが発生しました",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/dashboard/questions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">新規質問作成</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>質問情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="questionTitle">質問タイトル</Label>
                <Input
                  id="questionTitle"
                  placeholder="質問のタイトルを入力してください"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionText">質問内容</Label>
                <Textarea
                  id="questionText"
                  placeholder="質問内容を入力してください"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionType">質問タイプ</Label>
                <Select value={questionType} onValueChange={(value) => setQuestionType(value)} required>
                  <SelectTrigger id="questionType">
                    <SelectValue placeholder="質問タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">テキスト入力</SelectItem>
                    <SelectItem value="button">ボタン選択</SelectItem>
                    <SelectItem value="image_carousel">画像カルーセル</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(questionType === "button" || questionType === "image_carousel") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>選択肢</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      選択肢を追加
                    </Button>
                  </div>

                  {options.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      選択肢がありません。「選択肢を追加」ボタンをクリックして追加してください。
                    </div>
                  ) : (
                    // 選択肢の表示部分を更新して画像アップロード機能を追加
                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div key={index} className="space-y-3 border p-4 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Label htmlFor={`option-text-${index}`} className="mb-2 block">
                                選択肢テキスト
                              </Label>
                              <Input
                                id={`option-text-${index}`}
                                placeholder={`選択肢 ${index + 1}`}
                                value={option.text}
                                onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                                required
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(index)}
                              className="self-start mt-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {questionType === "image_carousel" && (
                            <div className="space-y-2">
                              <Label htmlFor={`option-image-${index}`} className="block">
                                画像URL
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id={`option-image-${index}`}
                                  placeholder="画像URLを入力または画像をアップロード"
                                  value={option.image_url || ""}
                                  onChange={(e) => handleOptionChange(index, "image_url", e.target.value)}
                                  className="flex-1"
                                />
                                <div className="flex gap-2">
                                  <div className="relative">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleImageUpload(index, e.target.files[0])
                                        }
                                      }}
                                    />
                                    <Button type="button" variant="outline">
                                      <Upload className="h-4 w-4 mr-2" />
                                      アップロード
                                    </Button>
                                  </div>
                                  <Button type="button" variant="outline" onClick={() => handleOpenGallery(index)}>
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    ギャラリー
                                  </Button>
                                </div>
                              </div>

                              {option.image_url && (
                                <div className="mt-2">
                                  <p className="text-sm text-muted-foreground mb-1">プレビュー:</p>
                                  <div className="relative w-full h-40 border rounded-md overflow-hidden">
                                    <img
                                      src={option.image_url || "/placeholder.svg"}
                                      alt={option.text}
                                      className="object-cover w-full h-full"
                                      onError={(e) => {
                                        e.currentTarget.src = "/placeholder.svg?height=160&width=320"
                                        e.currentTarget.alt = "イメージを読み込めませんでした"
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/questions">キャンセル</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      {/* 画像ギャラリーモーダル */}
      <ImageGalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} onSelect={handleSelectImage} />
    </DashboardLayout>
  )
}

