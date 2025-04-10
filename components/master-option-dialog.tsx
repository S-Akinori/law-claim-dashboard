"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Upload, ImageIcon } from "lucide-react"
import { AdminImageGalleryModal } from "@/components/admin-image-gallery-modal"

interface MasterOption {
  id: string
  question_id: string
  text: string
  image_url: string | null
  created_at: string
}

interface MasterOptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  option: MasterOption | null
  questionId: string
  onSubmit: () => void
}

export function MasterOptionDialog({ open, onOpenChange, option, questionId, onSubmit }: MasterOptionDialogProps) {
  const [text, setText] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [galleryOpen, setGalleryOpen] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (option) {
        // 編集モード
        setIsEdit(true)
        setText(option.text)
        setImageUrl(option.image_url)
        setFile(null)
        setActiveTab(option.image_url ? "url" : "upload")
      } else {
        // 新規作成モード
        setIsEdit(false)
        setText("")
        setImageUrl(null)
        setFile(null)
        setActiveTab("upload")
      }
      setError(null)
    }
  }, [open, option])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // プレビュー用にローカルURLを設定
      const localUrl = URL.createObjectURL(e.target.files[0])
      setImageUrl(localUrl)
    }
  }

  const uploadFile = async () => {
    if (!file) return null

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

  const handleGallerySelect = (url: string) => {
    setImageUrl(url)
    setFile(null)
    setGalleryOpen(false)
  }

  const handleSubmit = async () => {
    try {
      if (!text) {
        setError("選択肢テキストを入力してください")
        return
      }

      setLoading(true)
      setError(null)

      let finalImageUrl = imageUrl

      // ファイルがある場合はアップロード
      if (activeTab === "upload" && file) {
        finalImageUrl = await uploadFile()
      }

      if (isEdit && option) {
        // 既存の選択肢を更新
        const { error: updateError } = await supabase
          .from("master_options")
          .update({
            text: text,
            image_url: finalImageUrl,
          })
          .eq("id", option.id)

        if (updateError) {
          console.error("選択肢更新エラー:", updateError)
          setError("選択肢の更新に失敗しました")
          return
        }

        toast({
          title: "選択肢を更新しました",
          description: "選択肢が正常に更新されました",
        })
      } else {
        // 新規選択肢を作成
        const { error: insertError } = await supabase.from("master_options").insert({
          question_id: questionId,
          text: text,
          image_url: finalImageUrl,
        })

        if (insertError) {
          console.error("選択肢作成エラー:", insertError)
          setError("選択肢の作成に失敗しました")
          return
        }

        toast({
          title: "選択肢を作成しました",
          description: "選択肢が正常に作成されました",
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? "選択肢編集" : "新規選択肢作成"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && <div className="text-destructive text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="text">選択肢テキスト</Label>
              <Input
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="選択肢のテキストを入力"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>画像（任意）</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">アップロード</TabsTrigger>
                  <TabsTrigger value="url">ギャラリー</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Input
                      id="image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="image-file"
                      className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 px-4 py-5 text-center hover:bg-muted/25"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">クリックして画像を選択</span>
                    </Label>
                  </div>
                </TabsContent>
                <TabsContent value="url" className="space-y-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Button variant="outline" className="w-full h-32" onClick={() => setGalleryOpen(true)}>
                      <ImageIcon className="h-8 w-8 mr-2" />
                      ギャラリーから選択
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {imageUrl && (
              <div className="mt-2 flex justify-center">
                <div className="relative w-full max-w-xs">
                  <img
                    src={imageUrl || "/placeholder.svg"}
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

