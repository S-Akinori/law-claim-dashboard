"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/database.types"

interface ImageItem extends Tables<'images'> {
  master_options: {
    id: string
    text: string
    master_questions: {
      id: string
      title: string
    }
  }
}
interface MasterOption extends Tables<'master_options'> {
  master_questions: Tables<'master_questions'>
}

interface ImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: Tables<'accounts'>
  image: ImageItem | null
  onSubmit: () => void
}

export function MasterImageDialog({ open, onOpenChange, account, image, onSubmit }: ImageDialogProps) {
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [useMaster, setUseMaster] = useState(false)
  const [masterOptions, setMasterOptions] = useState<MasterOption[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("upload")
  const supabase = createClient()
  const { toast } = useToast()

  console.log(selectedOptionId)

  // アカウント設定とマスターオプションを取得
  useEffect(() => {
    const fetchAccountSettings = async () => {
      try {
        const { data: accountData, error: accountError } = await supabase.from("accounts").select("*").eq('id', account.id).single()

        if (accountError) {
          console.error("アカウント設定取得エラー:", accountError)
          return
        }

        if (accountData) {
          setUseMaster(accountData.use_master || true)

          // マスターデータ使用時のみマスターオプションを取得
          if (accountData.use_master) {
            fetchMasterOptions()
          }
        }
      } catch (error) {
        console.error("アカウント設定取得エラー:", error)
      }
    }

    if (open) {
      fetchAccountSettings()
    }
  }, [open, supabase])

  const fetchMasterOptions = async () => {
    try {
      // master_optionsとquestionsを結合して取得
      const { data, error } = await supabase
        .from("master_options")
        .select('*, master_questions(*)')

      if (error) {
        console.error("マスターオプション取得エラー:", error)
        return
      }

      setMasterOptions(data)

    } catch (error) {
      console.error("マスターオプション取得エラー:", error)
    }
  }


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const previewUrl = URL.createObjectURL(e.target.files[0])
      setUrl(previewUrl)
      setFile(e.target.files[0])
    }
  }

  const uploadFile = async () => {
    if (!file) return null

    try {
      // ファイル名を一意にするために現在時刻を追加
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `images/${account.user_id}/${account.id}/${fileName}`

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) {
        console.error("ファイルアップロードエラー:", uploadError)
        throw new Error("ファイルのアップロードに失敗しました")
      }

      // 公開URLを取得
      const { data: publicUrl } = supabase.storage.from("images").getPublicUrl(filePath)

      return publicUrl.publicUrl
    } catch (error) {
      console.error("ファイルアップロードエラー:", error)
      throw error
    }
  }

  const handleSubmit = async () => {
    const publicUrl = await uploadFile();
    if(image) { //編集
      if (publicUrl) {
        const { error: updateError } = await supabase
          .from("images")
          .update({ url: publicUrl, master_option_id: selectedOptionId !== "none" ? selectedOptionId : null })
          .eq("id", image.id);
      } else {
        const { error: updateError } = await supabase
          .from("images")
          .update({master_option_id: selectedOptionId !== "none" ? selectedOptionId : null })
          .eq("id", image.id);
      }
    } else { //新規作成
      if (publicUrl) {
        const { error: insertError } = await supabase
          .from("images")
          .insert({
            account_id: account.id,
            url: publicUrl,
            master_option_id: selectedOptionId !== "none" ? selectedOptionId : null
          });
      }
    }
    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>画像アップロード</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="file">ファイル</Label>
            <Input id="file" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          {file && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">選択されたファイル: {file.name}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="url">画像URL</Label>
            <Input
              id="url"
              value={url || image?.url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          {(url || image) && (
            <div className="mt-2 flex justify-center">
              <img
                src={url || image?.url}
                alt="プレビュー"
                className="max-h-40 max-w-full rounded-md object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                  e.currentTarget.alt = "画像の読み込みに失敗しました"
                }}
              />
            </div>
          )}

          {useMaster && masterOptions.length > 0 && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="masterOption">マスターオプションと関連付ける</Label>
              <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
                <SelectTrigger id="masterOption">
                  <SelectValue placeholder="オプションを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">関連付けなし</SelectItem>
                  {masterOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.master_questions.title} : 【{option.text}】
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">選択したオプションの画像として設定されます。</p>
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
  )
}

