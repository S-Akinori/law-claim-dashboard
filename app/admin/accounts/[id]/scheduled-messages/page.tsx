import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { ScheduledMessageDialog } from "@/components/master-scheduled-message-dialog"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Tables } from "@/database.types"

type ScheduledMessage = Tables<"scheduled_messages">

const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, "0")}:00`
}

interface ScheduledMessagesPageProps {
  params: {
    id: string
  }
}

export default async function ScheduledMessagesPage({ params }: ScheduledMessagesPageProps) {
  const { id } = params
  const supabase = await createClient()

  const { data: messages, error: messagesError } = await supabase
    .from("scheduled_messages")
    .select("*")
    .eq("account_id", id)
    .order("day_offset", { ascending: false })

  if (messagesError) {
    console.error("定期メッセージ取得エラー:", messagesError)
    return <p>定期メッセージ取得エラー</p>
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">定期メッセージ管理</h1>
            <p className="text-muted-foreground">ユーザーに定期的に送信するLINEメッセージを管理します</p>
          </div>
          <Button asChild>
            <Link href={`/admin/accounts/${id}/scheduled-messages/new`}>
              <Plus className="mr-2 h-4 w-4" />
              新規メッセージ
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>定期メッセージ一覧</CardTitle>
            <CardDescription>設定されている定期メッセージの一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">定期メッセージがまだ登録されていません</p>
                <Button asChild>
                  <Link href={`/admin/accounts/${id}/scheduled-messages/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    新規メッセージ
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>送信タイミング</TableHead>
                    <TableHead>メッセージ内容</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">
                        登録から{message.day_offset}日後 {formatHour(message.hour)}
                      </TableCell>
                      <TableCell className="max-w-md truncate">{message.message}</TableCell>
                      <TableCell>{new Date(message.created_at).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/accounts/${id}/scheduled-messages/${message.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                編集
                              </Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
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

