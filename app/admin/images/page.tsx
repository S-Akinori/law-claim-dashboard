"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, Image, Link2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ImageDialog } from "@/components/image-dialog"

interface ImageItem {
  id: string
  name: string
  url: string
  created_at: string
  master_option?: {
    id: string
    option_text: string
    question_text: string
  }
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [useMaster, setUseMaster] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchAccountSettings()
    fetchImages()
  }, [])

  const fetchAccountSettings = async () => {
    try {
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("use_master").single()

      if (accountError) {
        console.error("アカウント設定取得エラー:", accountError)
        return
      }

      if (accountData) {
        setUseMaster(accountData.use_master || false)
      }
    } catch (error) {
      console.error("アカウント設定取得エラー:", error)
    }
  }

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError(null)

      // 画像データを取得
      const { data, error } = await supabase.from("images").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("画像取得エラー:", error)
        setError("画像の取得に失敗しました")
        return
      }

      // マスターオプションとの関連付け情報を取得
      const imagesWithOptions = await Promise.all(
        (data || []).map(async (image) => {
          try {
            const { data: linkData, error: linkError } = await supabase
              .from("master_option_images")
              .select("master_option_id")
              .eq("image_id", image.id)
              .maybeSingle()

            if (linkError || !linkData) {
              return image
            }

            // マスターオプションの詳細を取得
            const { data: optionData, error: optionError } = await supabase
              .from("master_options")
              .select(`
                id,
                option_text,
                master_questions!inner(text)
              `)
              .eq("id", linkData.master_option_id)
              .maybeSingle()

            if (optionError || !optionData) {
              return image
            }

            return {
              ...image,
              master_option: {
                id: optionData.id,
                option_text: optionData.option_text,
                question_text: optionData.master_questions ? optionData.master_questions.text : "不明",
              },
            }
          } catch (err) {
            console.error("関連付け取得エラー:", err)
            return image
          }
        }),
      )

      setImages(imagesWithOptions)
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      // 関連付けを先に削除
      await supabase.from("master_option_images").delete().eq("image_id", imageId)

      // 画像を削除
      const { error } = await supabase.from("images").delete().eq("id", imageId)

      if (error) {
        console.error("画像削除エラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "画像の削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setImages(images.filter((image) => image.id !== imageId))

      toast({
        title: "画像を削除しました",
        description: "画像が正常に削除されました",
      })
    } catch (err) {
      console.error("画像削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "画像の削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenDialog = (image: ImageItem | null = null) => {
    setSelectedImage(image)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchImages()
    setDialogOpen(false)
  }

  if (loading) {
    return (
      <>
        <div className="flex justify-center py-6">
          <p>読み込み中...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">画像管理</h1>
            <p className="text-muted-foreground">
              {useMaster
                ? "LINEボットで使用する画像を管理します。マスターオプションに画像を関連付けることができます。"
                : "LINEボットで使用する画像を管理します。"}
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新規画像
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>画像一覧</CardTitle>
            <CardDescription>LINEボットで使用する画像の一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">画像がまだ登録されていません</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初の画像をアップロード
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>名前</TableHead>
                    <TableHead>URL</TableHead>
                    {useMaster && <TableHead>関連付け</TableHead>}
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {images.map((image) => (
                    <TableRow key={image.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {image.url ? (
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Image className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{image.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        <a
                          href={image.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {image.url}
                        </a>
                      </TableCell>
                      {useMaster && (
                        <TableCell>
                          {image.master_option ? (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Link2 className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {image.master_option.question_text} - {image.master_option.option_text}
                              </span>
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">なし</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>{new Date(image.created_at).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(image)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteImage(image.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ImageDialog open={dialogOpen} onOpenChange={setDialogOpen} image={selectedImage} onSubmit={handleDialogSubmit} />
    </>
  )
}

