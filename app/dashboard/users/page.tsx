"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string | null
  created_at: string
  response_count: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // ユーザーデータを取得
      const { data: usersData, error: usersError } = await supabase.from("line_users").select(`
          id,
          name,
          created_at
        `)

      if (usersError) {
        console.error("ユーザーデータ取得エラー:", usersError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "ユーザーデータの取得に失敗しました",
        })
        return
      }

      // 各ユーザーの回答数を取得
      const usersWithResponses = await Promise.all(
        usersData.map(async (user) => {
          const { count, error: countError } = await supabase
            .from("user_responses")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)

          return {
            ...user,
            response_count: count || 0,
          }
        }),
      )

      setUsers(usersWithResponses)
    } catch (error) {
      console.error("データ取得エラー:", error)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "データの取得中にエラーが発生しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ユーザー管理</h1>
          <p className="text-muted-foreground">LINE Botを利用しているユーザーの一覧と回答データを確認できます</p>
        </div>

        <div className="flex items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ユーザーを検索..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ユーザー一覧</CardTitle>
            <CardDescription>システムに登録されているユーザーの一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <p>読み込み中...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-muted-foreground">ユーザーがまだ登録されていません</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ユーザーID</TableHead>
                    <TableHead>名前</TableHead>
                    <TableHead>回答数</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.name || "未設定"}</TableCell>
                      <TableCell>{user.response_count}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString("ja-JP")}</TableCell>
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
                              <Button variant="ghost" className="w-full justify-start">
                                <Eye className="mr-2 h-4 w-4" />
                                回答を表示
                              </Button>
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
    </DashboardLayout>
  )
}

