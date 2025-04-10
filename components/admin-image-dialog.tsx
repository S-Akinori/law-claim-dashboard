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

interface ImageItem {
  id: string
  name: string
  url: string
  account_id: string
  created_at: string
}

interface Account {
  id: string
  name: string
}

interface MasterOption {
  id: string
  question_id: string
  option_text: string
  question_text?: string
}

interface ImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: ImageItem | null
  onSubmit: () => void
  accounts: Account[]
}

export function ImageDialog({ open, onOpenChange, image, onSubmit, accounts }: ImageDialogProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [accountId, setAccountId] = useState<string>("")
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

  // マスターオプションを取得
  useEffect(() => {
    const fetchMasterOptions = async () => {
      try {
        // master_optionsとquestionsを結合して取得
        const { data, error } = await supabase
          .from("master_options")
          .select(`
            id,
            question_id,
            option_text,
            master_questions!inner(text)
          `)
          .order("question_id")

        if (error) {
          console.error("マスターオプション取得エラー:", error)
          return
        }

        // データを整形
        const formattedOptions = data.map((item) => ({
          id: item.id,
          question_id: item.question_id,
          option_text: item.option_text,
          question_text: item.master_questions ? item.master_questions.text : "不明",
        }))

        setMasterOptions(formattedOptions)

        // 編集モードで、既存の画像がマスターオプションに関連付けられている場合
        if (isEdit && image) {
          const { data: linkData, error: linkError } = await supabase
            .from("master_option_images")
            .select("master_option_id")
            .eq("image_id", image.id)
            .single()

          if (!linkError && linkData) {
            setSelectedOptionId(linkData.master_option_id)
          }
        }
      } catch (error) {
        console.error("マスターオプション取得エラー:", error)
      }
    }

    if (open) {
      fetchMasterOptions()
    }
  }, [open, supabase, isEdit, image])

  // ダイアログが開かれたときに初期化
  useEffect(() => {
    if (open) {
      if (image) {
        // 編集モード
        setIsEdit(true)
        setName(image.name)
        setUrl(image.url)
        setAccountId(image.account_id)
        setFile(null)
        setActiveTab("url")
      } else {
        // 新規作成モード
        setIsEdit(false)
        setName("")
        setUrl("")
        setAccountId(accounts.length > 0 ? accounts[0].id : "")
        setFile(null)
        setSelectedOptionId("")
        setActiveTab("upload")
      }
      setError(null)
    }
  }, [open, image, accounts])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
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

  const handleSubmit = async () => {
    try {
      if (!name) {
        setError("画像名を入力してください")
        return
      }

      if (activeTab === "upload" && !file && !isEdit) {
        setError("ファイルを選択してください")
        return
      }

      if (activeTab === "url" && !url) {
        setError("URLを入力してください")
        return
      }

      if (!accountId) {
        setError("アカウントを選択してください")
        return
      }

      setLoading(true)
      setError(null)

      let imageUrl = url
      let imageId = image?.id

      // ファイルがある場合はアップロード
      if (activeTab === "upload" && file) {
        imageUrl = (await uploadFile()) || ""
      }

      if (isEdit && image) {
        // 既存の画像を更新
        const { error: updateError } = await supabase
          .from("images")
          .update({
            name: name,
            url: imageUrl,
            account_id: accountId,
          })
          .eq("id", image.id)

        if (updateError) {
          console.error("画像更新エラー:", updateError)
          setError("画像の更新に失敗しました")
          return
        }

        toast({
          title: "画像を更新しました",
          description: "画像が正常に更新されました",
        })
      } else {
        // 新規画像を作成
        const { data: insertData, error: insertError } = await supabase
          .from("images")
          .insert({
            name: name,
            url: imageUrl,
            account_id: accountId,
          })
          .select()

        if (insertError) {
          console.error("画像作成エラー:", insertError)
          setError("画像の作成に失敗しました")
          return
        }

        if (insertData && insertData.length > 0) {
          imageId = insertData[0].id
        }

        toast({
          title: "画像を作成しました",
          description: "画像が正常に作成されました",
        })
      }

      // マスターオプションが選択されている場合
      if (imageId && selectedOptionId) {
        // 既存の関連付けを削除
        await supabase.from("master_option_images").delete().eq("image_id", imageId)

        // 新しい関連付けを作成
        const { error: linkError } = await supabase.from("master_option_images").insert({
          master_option_id: selectedOptionId,
          image_id: imageId,
        })

        if (linkError) {
          console.error("オプション関連付けエラー:", linkError)
          toast({
            variant: "destructive",
            title: "警告",
            description: "画像は保存されましたが、マスターオプションとの関連付けに失敗しました",
          })
        } else {
          toast({
            title: "関連付けを更新しました",
            description: "マスターオプションと画像の関連付けが更新されました",
          })
        }
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "画像編集" : "新規画像アップロード"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">画像名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="画像名を入力"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">アカウント</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger id="account">
                <SelectValue placeholder="アカウントを選択" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">ファイルアップロード</TabsTrigger>
              <TabsTrigger value="url">URL指定</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">ファイル</Label>
                <Input id="file" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              {file && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">選択されたファイル: {file.name}</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">画像URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {url && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={url || "/placeholder.svg"}
                    alt="プレビュー"
                    className="max-h-40 max-w-full rounded-md object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                      e.currentTarget.alt = "画像の読み込みに失敗しました"
                    }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {masterOptions.length > 0 && (
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
                      {option.question_text} - {option.option_text}
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

