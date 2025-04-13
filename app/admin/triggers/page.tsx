import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function TriggersPage() {
  const supabase = await createClient()
  const { data: triggersData, error: triggersError } = await supabase.from("master_start_triggers").select(`*, master_questions(*)`)

  if (triggersError) {
    console.error("トリガー情報取得エラー:", triggersError)
    return <p>トリガー情報取得エラー</p>
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">スタートトリガー管理</h1>
            <p className="text-muted-foreground">特定のキーワードで開始する質問を設定します</p>
          </div>
          <Button asChild>
            <Link href="/admin/triggers/new">
              <Plus className="mr-2 h-4 w-4" />
              新規トリガー
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>スタートトリガー一覧</CardTitle>
            <CardDescription>設定されているキーワードと開始質問の一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {triggersData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">スタートトリガーがまだ登録されていません</p>
                <Button asChild>
                  <Link href="/admin/triggers/new">
                    <Plus className="mr-2 h-4 w-4" />
                    新規トリガー
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>キーワード</TableHead>
                    <TableHead>開始質問</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {triggersData.map((trigger) => (
                    <TableRow key={trigger.id}>
                      <TableCell className="font-medium">{trigger.keyword}</TableCell>
                      <TableCell>{trigger.master_questions.title}</TableCell>
                      <TableCell>{new Date(trigger.created_at).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive focus:text-destructive" asChild>
                              <Link href={`/admin/triggers/${trigger.id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> 編集
                              </Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem 
                              asChild
                              className="text-destructive focus:text-destructive"
                            >
                              <AdminDeleteStartTriggersButton triggerId={trigger.id} />
                            </DropdownMenuItem> */}
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
    </>
  )
}

