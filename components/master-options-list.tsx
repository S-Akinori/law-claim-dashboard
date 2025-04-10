"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { MasterOptionDialog } from "@/components/master-option-dialog"

interface MasterOption {
  id: string
  question_id: string
  text: string
  image_url: string | null
  created_at: string
}

interface MasterQuestion {
  id: string
  text: string
}

interface MasterOptionsListProps {
  questionId: string
  questionText: string
}

export function MasterOptionsList({ questionId, questionText }: MasterOptionsListProps) {
  const [options, setOptions] = useState<MasterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<MasterOption | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchOptions()
  }, [questionId])

  const fetchOptions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("master_options")
        .select("*")
        .eq("question_id", questionId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("選択肢取得エラー:", error)
        setError("選択肢の取得に失敗しました")
        return
      }

      setOptions(data || [])
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    try {
      // 関連するマスターオプション画像を確認
      const { count, error: countError } = await supabase
        .from("master_option_images")
        .select("*", { count: "exact", head: true })
        .eq("master_option_id", optionId)

      if (countError) {
        console.error("関連データ確認エラー:", countError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "関連データの確認に失敗しました",
        })
        return
      }

      if (count && count > 0) {
        toast({
          variant: "destructive",
          title: "削除できません",
          description: `この選択肢には${count}個の画像が関連付けられています。先に画像の関連付けを削除してください。`,
        })
        return
      }

      // 選択肢を削除
      const { error } = await supabase.from("master_options").delete().eq("id", optionId)

      if (error) {
        console.error("選択肢削除エラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "選択肢の削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setOptions(options.filter((option) => option.id !== optionId))

      toast({
        title: "選択肢を削除しました",
        description: "選択肢が正常に削除されました",
      })
    } catch (err) {
      console.error("選択肢削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "選択肢の削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenDialog = (option: MasterOption | null = null) => {
    setSelectedOption(option)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchOptions()
    setDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>選択肢一覧: {questionText}</CardTitle>
          <CardDescription>質問に対する選択肢の一覧です</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          新規選択肢
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {options.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="mb-4 text-muted-foreground">選択肢がまだ登録されていません</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              最初の選択肢を作成
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>選択肢テキスト</TableHead>
                <TableHead>画像</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map((option) => (
                <TableRow key={option.id}>
                  <TableCell className="font-medium">{option.text}</TableCell>
                  <TableCell>
                    {option.image_url ? (
                      <div className="h-10 w-10 rounded-md overflow-hidden">
                        <img
                          src={option.image_url || "/placeholder.svg"}
                          alt={option.text}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">なし</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(option.created_at).toLocaleDateString("ja-JP")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">メニューを開く</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(option)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteOption(option.id)}
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

      <MasterOptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        option={selectedOption}
        questionId={questionId}
        onSubmit={handleDialogSubmit}
      />
    </Card>
  )
}

