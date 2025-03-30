"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { CompensationMappingDialog } from "@/components/compensation-mapping-dialog"

interface CompensationTable {
  id: string
  account_id: string
  name: string
  table_name: string
  description: string | null
  created_at: string
}

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface Mapping {
  id: string
  compensation_table_id: string
  kind: string
  question_id: string
  created_at: string
  question?: Question
}

export default function CompensationTableDetailPage() {
  const [table, setTable] = useState<CompensationTable | null>(null)
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMapping, setSelectedMapping] = useState<Mapping | null>(null)
  const params = useParams()
  const router = useRouter()
  const tableId = params.id as string
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [tableId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // テーブル情報を取得
      const { data: tableData, error: tableError } = await supabase
        .from("compensation_tables")
        .select("*")
        .eq("id", tableId)
        .single()

      if (tableError) {
        console.error("テーブル取得エラー:", tableError)
        setError("慰謝料テーブルの取得に失敗しました")
        return
      }

      setTable(tableData)

      // マッピング情報を取得
      const { data: mappingsData, error: mappingsError } = await supabase
        .from("compensation_input_mapping")
        .select(`
          *,
          question:question_id(id, title, text, type)
        `)
        .eq("compensation_table_id", tableId)
        .order("created_at", { ascending: true })

      if (mappingsError) {
        console.error("マッピング取得エラー:", mappingsError)
        setError("マッピング情報の取得に失敗しました")
        return
      }

      setMappings(mappingsData || [])

      // 質問一覧を取得
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("id, title, text, type")
        .order("created_at", { ascending: true })

      if (questionsError) {
        console.error("質問取得エラー:", questionsError)
        setError("質問データの取得に失敗しました")
        return
      }

      setQuestions(questionsData || [])
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase.from("compensation_input_mapping").delete().eq("id", mappingId)

      if (error) {
        console.error("マッピング削除エラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "マッピングの削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setMappings(mappings.filter((mapping) => mapping.id !== mappingId))

      toast({
        title: "マッピングを削除しました",
        description: "マッピングが正常に削除されました",
      })
    } catch (err) {
      console.error("マッピング削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "マッピングの削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenDialog = (mapping: Mapping | null = null) => {
    setSelectedMapping(mapping)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchData()
    setDialogOpen(false)
  }

  // 入力種類の表示名を取得
  const getKindLabel = (kind: string): string => {
    const kindMap: { [key: string]: string } = {
      hospitalization_months: "入院月数",
      outpatient_months: "通院月数",
      grade: "等級",
      age: "年齢",
      injury_type: "怪我の種類",
      severity: "重症度",
    }
    return kindMap[kind] || kind
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-6">
          <p>読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!table) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>テーブルが見つかりませんでした</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/compensation-tables">一覧に戻る</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/dashboard/compensation-tables">
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{table.name}</h1>
            <p className="text-muted-foreground">テーブルID: {table.table_name}</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>入力マッピング設定</CardTitle>
              <CardDescription>慰謝料計算に必要な入力項目と質問のマッピングを設定します</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              マッピング追加
            </Button>
          </CardHeader>
          <CardContent>
            {mappings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">マッピングがまだ登録されていません</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のマッピングを作成
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>入力種類</TableHead>
                    <TableHead>質問</TableHead>
                    <TableHead>質問タイプ</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">{getKindLabel(mapping.kind)}</TableCell>
                      <TableCell>{mapping.question?.title || mapping.question?.text || "不明な質問"}</TableCell>
                      <TableCell>{mapping.question?.type || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(mapping)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteMapping(mapping.id)}
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

        {table.description && (
          <Card>
            <CardHeader>
              <CardTitle>テーブル説明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{table.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <CompensationMappingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mapping={selectedMapping}
        tableId={tableId}
        questions={questions}
        onSubmit={handleDialogSubmit}
      />
    </DashboardLayout>
  )
}

