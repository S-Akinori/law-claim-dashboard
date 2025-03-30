"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, Settings } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { CompensationTableDialog } from "@/components/compensation-table-dialog"

interface CompensationTable {
  id: string
  account_id: string
  name: string
  table_name: string
  description: string | null
  created_at: string
}

export default function CompensationTablesPage() {
  const [tables, setTables] = useState<CompensationTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<CompensationTable | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setLoading(true)
      setError(null)

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("id").single()

      if (accountError || !accountData) {
        console.error("アカウント情報取得エラー:", accountError)
        setError("アカウント情報の取得に失敗しました")
        return
      }

      // 慰謝料テーブルを取得
      const { data: tablesData, error: tablesError } = await supabase
        .from("compensation_tables")
        .select("*")
        .eq("account_id", accountData.id)
        .order("created_at", { ascending: true })

      if (tablesError) {
        console.error("テーブル取得エラー:", tablesError)
        setError("慰謝料テーブルの取得に失敗しました")
        return
      }

      setTables(tablesData || [])
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    try {
      // まず、関連するマッピングを削除
      const { error: mappingError } = await supabase
        .from("compensation_input_mapping")
        .delete()
        .eq("compensation_table_id", tableId)

      if (mappingError) {
        console.error("マッピング削除エラー:", mappingError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "関連するマッピングの削除に失敗しました",
        })
        return
      }

      // 次に、テーブル自体を削除
      const { error } = await supabase.from("compensation_tables").delete().eq("id", tableId)

      if (error) {
        console.error("テーブル削除エラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "慰謝料テーブルの削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setTables(tables.filter((table) => table.id !== tableId))

      toast({
        title: "テーブルを削除しました",
        description: "慰謝料テーブルが正常に削除されました",
      })
    } catch (err) {
      console.error("テーブル削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "テーブルの削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenDialog = (table: CompensationTable | null = null) => {
    setSelectedTable(table)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchTables()
    setDialogOpen(false)
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">慰謝料テーブル管理</h1>
            <p className="text-muted-foreground">慰謝料計算に使用するテーブルを管理します</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新規テーブル
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>慰謝料テーブル一覧</CardTitle>
            <CardDescription>設定されている慰謝料テーブルの一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">慰謝料テーブルがまだ登録されていません</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のテーブルを作成
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>テーブル名</TableHead>
                    <TableHead>テーブルID</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>{table.table_name}</TableCell>
                      <TableCell className="max-w-md truncate">{table.description || "-"}</TableCell>
                      <TableCell>{new Date(table.created_at).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/compensation-tables/${table.id}`}>
                              <Settings className="h-4 w-4" />
                              <span className="sr-only">設定</span>
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">メニューを開く</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(table)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTable(table.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CompensationTableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        table={selectedTable}
        onSubmit={handleDialogSubmit}
      />
    </DashboardLayout>
  )
}

