"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
  Image,
  ArrowRight,
  Play,
  Mail,
  Clock,
  Calculator,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [userInitial, setUserInitial] = useState("U")
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // セッションの自動更新を設定
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true)

        // ユーザー情報の取得
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
          console.error("ユーザー情報取得エラー:", userError)
          router.push("/login")
          return
        }

        // アカウント情報の取得
        // ユーザーIDに関連付けられたアカウント情報を取得
        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .select("name")
          .eq("user_id", userData.user.id)
          .single()

        if (!accountError && accountData) {
          setCompanyName(accountData.name)
          setUserInitial(accountData.name.charAt(0).toUpperCase())
        } else {
          // ユーザーIDで見つからない場合、メタデータのアカウントIDで検索
          const accountId = userData.user.user_metadata?.account_id
          if (accountId) {
            const { data: accountByIdData, error: accountByIdError } = await supabase
              .from("accounts")
              .select("name")
              .eq("id", accountId)
              .single()

            if (!accountByIdError && accountByIdData) {
              setCompanyName(accountByIdData.name)
              setUserInitial(accountByIdData.name.charAt(0).toUpperCase())
            }
          }
        }
      } catch (error) {
        console.error("プロフィール取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [supabase, router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("ログアウトエラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "ログアウト中にエラーが発生しました",
        })
        return
      }

      toast({
        title: "ログアウトしました",
        description: "正常にログアウトされました",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("ログアウトエラー:", error)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "ログアウト中にエラーが発生しました",
      })
    }
  }

  const routes = [
    {
      href: "/dashboard",
      label: "ダッシュボード",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/dashboard/questions",
      label: "質問管理",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/dashboard/routes",
      label: "質問ルート",
      icon: <ArrowRight className="h-5 w-5" />,
    },
    {
      href: "/dashboard/triggers",
      label: "スタートトリガー",
      icon: <Play className="h-5 w-5" />,
    },
    {
      href: "/dashboard/scheduled-messages",
      label: "定期メッセージ",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      href: "/dashboard/compensation-tables",
      label: "慰謝料テーブル",
      icon: <Calculator className="h-5 w-5" />,
    },
    {
      href: "/dashboard/email-templates",
      label: "メールテンプレート",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      href: "/dashboard/users",
      label: "ユーザー",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/dashboard/analytics",
      label: "分析",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      href: "/dashboard/images",
      label: "画像管理",
      icon: <Image className="h-5 w-5" />,
    },
    {
      href: "/dashboard/settings",
      label: "設定",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex items-center border-b pb-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                <MessageSquare className="h-6 w-6" />
                <span>交通事故慰謝料計算</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-4 flex flex-col gap-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {route.icon}
                  {route.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium justify-start hover:bg-muted"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                ログアウト
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-6 w-6" />
          <span className="hidden md:inline-block">交通事故慰謝料計算</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{companyName}</span>
            <Avatar>
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">ログアウト</span>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

