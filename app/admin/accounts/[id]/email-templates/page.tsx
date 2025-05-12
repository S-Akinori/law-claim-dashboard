import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, DatabaseBackupIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

interface TriggerPageProps {
  params: {
    id: string
  }
}

export default async function EmailTemplatesPage({ params }: TriggerPageProps) {
  const { id: accountId } = params
  const supabase = await createClient()
  const { data: emailTemplateData, error: triggersError } = await supabase.from("email_templates").select(`*`).eq("account_id", accountId)

  if (triggersError) {
    console.error("メールテンプレート情報取得エラー:", triggersError)
    return <p>メールテンプレート情報取得エラー</p>
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">メールテンプレート管理</h1>
            <p className="text-muted-foreground">特定のキーワードで開始する質問を設定します</p>
          </div>
          <Button asChild>
            <Link href={`/admin/accounts/${accountId}/email-templates/new`} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              新規メールテンプレート
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>メールテンプレート一覧</CardTitle>
            <CardDescription>設定されているキーワードと開始質問の一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {emailTemplateData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">メールテンプレートがまだ登録されていません</p>
                <Button asChild>
                  <Link href={`/admin/accounts/${accountId}/email-templates/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    新規メールテンプレート
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>件名</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailTemplateData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell className="font-medium">{data.subject}</TableCell>
                      <TableCell>{new Date(data.created_at).toLocaleDateString("ja-JP")}</TableCell>
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
                              <Link href={`/admin/accounts/${data.account_id}/email-templates/${data.id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> 編集
                              </Link>
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
    </>
  )
}

