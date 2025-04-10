"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { ScheduledMessageDialog } from "@/components/master-scheduled-message-dialog"

interface ScheduledMessage {
  id: string
  day_offset: number
  hour: number
  message: string
  created_at: string
}

export default function ScheduledMessagesPage() {
  const [messages, setMessages] = useState<ScheduledMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ScheduledMessage | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      
      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("ユーザー情報取得エラー:", userError)
        setError("ユーザー情報の取得に失敗しました")
        return
      }

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("id").eq('user_id', userData.user.id).single()

      if (accountError || !accountData) {
        console.error("アカウント情報取得エラー:", accountError)
        setError("アカウント情報の取得に失敗しました")
        return
      }

      // 定期メッセージを取得
      const { data: messagesData, error: messagesError } = await supabase
        .from("master_scheduled_messages")
        .select("*")
        .order("day_offset", { ascending: true })
        .order("hour", { ascending: true })

      if (messagesError) {
        console.error("メッセージ取得エラー:", messagesError)
        setError("メッセージの取得に失敗しました")
        return
      }

      setMessages(messagesData || [])
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from("master_scheduled_messages").delete().eq("id", messageId)

      if (error) {
        console.error("メッセージ削除エラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "メッセージの削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setMessages(messages.filter((message) => message.id !== messageId))

      toast({
        title: "メッセージを削除しました",
        description: "定期メッセージが正常に削除されました",
      })
    } catch (err) {
      console.error("メッセージ削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "メッセージの削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenDialog = (message: ScheduledMessage | null = null) => {
    setSelectedMessage(message)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchMessages()
    setDialogOpen(false)
  }

  // 時間を「HH:00」形式でフォーマット
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">定期メッセージ管理</h1>
            <p className="text-muted-foreground">ユーザーに定期的に送信するLINEメッセージを管理します</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新規メッセージ
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>定期メッセージ一覧</CardTitle>
            <CardDescription>設定されている定期メッセージの一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">定期メッセージがまだ登録されていません</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のメッセージを作成
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
                            <DropdownMenuItem onClick={() => handleOpenDialog(message)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteMessage(message.id)}
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

      <ScheduledMessageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        message={selectedMessage}
        onSubmit={handleDialogSubmit}
      />
    </>
  )
}

