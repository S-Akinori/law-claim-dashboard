"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { AdminImageGalleryModal } from "@/components/admin-image-gallery-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface MasterQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: MasterQuestion | null
  onSubmit: () => void
}

export function MasterQuestionDialog({ open, onOpenChange, question, onSubmit }: MasterQuestionDialogProps) {
  const [text, setText] = useState("")
  const [title, setTitle] = useState("質問")
  const [type, setType] = useState<string>("text")
  const [imageOptions, setImageOptions] = useState<ImageOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)
  const [uploadFiles, setUploadFiles] = useState<{ [key: number]: File | null }>({})
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (question) {
        // 編集モード
        setIsEdit(true)
        setTitle(question.title)
        setType(question.type)

        // テキストフィールドの処理
        if (question.type === "image_carousel") {
          try {
            // textフィールドからJSON形式の画像オプションを解析
            const parsedOptions = JSON.parse(question.text)
            if (Array.isArray(parsedOptions)) {
              setImageOptions(parsedOptions)
              setText("") // 画像カルーセルの場合、textは使用しない
            } else {
              setImageOptions([])
              setText(question.text)
            }
          } catch (e) {
            // JSONとして解析できない場合は通常のテキストとして扱う
            setImageOptions([])
            setText(question.text)
          }
        } else {
          setText(question.text)
          setImageOptions([])
        }
      } else {
        // 新規作成モード
        setIsEdit(false)
        setText("")
        setTitle("質問")
        setType("text")
        setImageOptions([])
      }
      setError(null)
      setUploadFiles({})
    }
  }, [open, question])

  // タイプが変更されたときの処理
  const handleTypeChange = (newType: string) => {
    setType(newType)
    if (newType === "image_carousel" && imageOptions.length === 0) {
      // 画像カルーセルに変更され、まだ画像がない場合は空の画像オプションを追加
      setImageOptions([{ url: "", caption: "" }])
    }
  }

  // 画像オプションを追加
  const addImageOption = () => {
    setImageOptions([...imageOptions, { url: "", caption: "" }])
  }

  // 画像オプションを削除
  const removeImageOption = (index: number) => {
    const newOptions = [...imageOptions]
    newOptions.splice(index, 1)
    setImageOptions(newOptions)

    // アップロードファイルも削除
    const newUploadFiles = { ...uploadFiles }
    delete newUploadFiles[index]
    setUploadFiles(newUploadFiles)
  }

  // 画像オプションを更新
  const updateImageOption = (index: number, field: keyof ImageOption, value: string) => {
    const newOptions = [...imageOptions]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setImageOptions(newOptions)
  }

  // ファイル選択ハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadFiles({ ...uploadFiles, [index]: file })

      // プレビュー用にローカルURLを設定
      const localUrl = URL.createObjectURL(file)
      updateImageOption(index, "url", localUrl)
    }
  }

  // ギャラリーから画像を選択
  const handleGallerySelect = (imageUrl: string) => {
    if (currentImageIndex !== null) {
      updateImageOption(currentImageIndex, "url", imageUrl)
      // アップロードファイルをクリア（URLを使用するため）
      const newUploadFiles = { ...uploadFiles }
      delete newUploadFiles[currentImageIndex]
      setUploadFiles(newUploadFiles)
    }
    setGalleryOpen(false)
    setCurrentImageIndex(null)
  }

  // 画像アップロード処理
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // ファイル名を一意にするために現在時刻を追加
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `images/${fileName}`

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage.from("line-bot").upload(filePath, file)

      if (uploadError) {
        console.error("ファイルアップロードエラー:", uploadError)
        throw new Error("ファイルのアップロードに失敗しました")
      }

      // 公開URLを取得
      const { data: publicUrl } = supabase.storage.from("line-bot").getPublicUrl(filePath)

      return publicUrl.publicUrl
    } catch (error) {
      console.error("ファイルアップロードエラー:", error)
      throw error
    }
  }

  const handleSubmit = async () => {
    try {
      if (type === "image_carousel" && imageOptions.length === 0) {
        setError("画像カルーセルには少なくとも1つの画像を追加してください")
        return
      }

      if (type !== "image_carousel" && !text) {
        setError("質問内容を入力してください")
        return
      }

      setLoading(true)
      setError(null)

      // 画像のアップロード処理
      if (type === "image_carousel") {
        const newImageOptions = [...imageOptions]

        // ファイルアップロードが必要な画像オプションを処理
        for (const index in uploadFiles) {
          if (uploadFiles[index]) {
            try {
              const imageUrl = await uploadImage(uploadFiles[index]!)
              newImageOptions[Number.parseInt(index)].url = imageUrl
            } catch (err) {
              console.error(`画像 ${Number.parseInt(index) + 1} のアップロードに失敗:`, err)
              setError(`画像 ${Number.parseInt(index) + 1} のアップロードに失敗しました`)
              setLoading(false)
              return
            }
          }
        }

        setImageOptions(newImageOptions)
      }

      // 保存するデータを準備
      let saveText = text
      if (type === "image_carousel") {
        // 画像カルーセルの場合、画像オプションをJSON形式で保存
        saveText = JSON.stringify(imageOptions)
      }

      if (isEdit && question) {
        // 既存の質問を更新
        const { error: updateError } = await supabase
          .from("master_questions")
          .update({
            text: saveText,
            title: title,
            type: type,
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
          text: saveText,
          title: title,
          type: type,
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

      // アップロードファイルをクリア
      setUploadFiles({})

      onSubmit()
    } catch (err) {
      console.error("保存エラー:", err)
      setError("保存中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // ギャラリーを開く
  const openGallery = (index: number) => {
    setCurrentImageIndex(index)
    setGalleryOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? "マスター質問編集" : "新規マスター質問作成"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && <div className="text-destructive text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="title">質問タイトル</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="質問タイトルを入力してください"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">質問タイプ</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="質問タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">テキスト</SelectItem>
                  <SelectItem value="image_carousel">画像カルーセル</SelectItem>
                  <SelectItem value="button">ボタン</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "image_carousel" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>画像選択肢</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addImageOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    画像を追加
                  </Button>
                </div>

                {imageOptions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">画像が追加されていません</div>
                ) : (
                  <div className="space-y-4">
                    {imageOptions.map((option, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>画像 {index + 1}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImageOption(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <Label>画像</Label>
                              <Tabs defaultValue="upload" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="upload">アップロード</TabsTrigger>
                                  <TabsTrigger value="gallery">ギャラリー</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="space-y-4">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Input
                                      id={`image-file-${index}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileChange(e, index)}
                                      className="hidden"
                                    />
                                    <Label
                                      htmlFor={`image-file-${index}`}
                                      className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 px-4 py-5 text-center hover:bg-muted/25"
                                    >
                                      <Upload className="h-8 w-8 text-muted-foreground" />
                                      <span className="mt-2 text-sm text-muted-foreground">クリックして画像を選択</span>
                                    </Label>
                                  </div>
                                </TabsContent>
                                <TabsContent value="gallery" className="space-y-4">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Button
                                      variant="outline"
                                      className="w-full h-32"
                                      onClick={() => openGallery(index)}
                                    >
                                      <ImageIcon className="h-8 w-8 mr-2" />
                                      ギャラリーから選択
                                    </Button>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>

                            {option.url && (
                              <div className="mt-2 flex justify-center">
                                <div className="relative w-full max-w-xs">
                                  <img
                                    src={option.url || "/placeholder.svg"}
                                    alt="プレビュー"
                                    className="max-h-40 w-full rounded-md object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg"
                                      e.currentTarget.alt = "画像の読み込みに失敗しました"
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor={`image-caption-${index}`}>選択肢テキスト</Label>
                              <Input
                                id={`image-caption-${index}`}
                                value={option.caption || ""}
                                onChange={(e) => updateImageOption(index, "caption", e.target.value)}
                                placeholder="この画像の選択肢テキスト"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
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
            )}
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

      <AdminImageGalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} onSelect={handleGallerySelect} />
    </>
  )
}

