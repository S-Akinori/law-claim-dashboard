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
import { EmailTemplateDialog } from "@/components/email-template-dialog"

interface EmailTemplate {
  id: string
  subject: string
  body: string
  created_at: string
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
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

      // メールテンプレートを取得
      const { data: templatesData, error: templatesError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("account_id", accountData.id)
        .order("created_at", { ascending: true })

      if (templatesError) {
        console.error("テンプレート取得エラー:", templatesError)
        setError("テンプレートの取得に失敗しました")
        return
      }

      setTemplates(templatesData || [])
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase.from("email_templates").delete().eq("id", templateId)

      if (error) {
        console.error("テンプレート削除エラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "テンプレートの削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setTemplates(templates.filter((template) => template.id !== templateId))

      toast({
        title: "テンプレートを削除しました",
        description: "テンプレートが正常に削除されました",
      })
    } catch (err) {
      console.error("テンプレート削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "テンプレートの削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenDialog = (template: EmailTemplate | null = null) => {
    setSelectedTemplate(template)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchTemplates()
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
            <h1 className="text-3xl font-bold tracking-tight">メールテンプレート管理</h1>
            <p className="text-muted-foreground">ユーザーに送信するメールのテンプレートを管理します</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新規テンプレート
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>メールテンプレート一覧</CardTitle>
            <CardDescription>設定されているメールテンプレートの一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">メールテンプレートがまだ登録されていません</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のテンプレートを作成
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>件名</TableHead>
                    <TableHead>本文</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.subject}</TableCell>
                      <TableCell className="max-w-md truncate">{template.body}</TableCell>
                      <TableCell>{new Date(template.created_at).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(template)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template.id)}
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

      <EmailTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
        onSubmit={handleDialogSubmit}
      />
    </DashboardLayout>
  )
}

