"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Home, LogOut, Menu, Settings, Users, X, Shield, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [open, setOpen] = useState(false)
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

    setLoading(false)

    return () => subscription.unsubscribe()
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
      href: "/admin",
      label: "ダッシュボード",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/admin/master-questions",
      label: "マスター質問",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/admin/master-routes",
      label: "マスタールート",
      icon: <ArrowRight className="h-5 w-5" />,
    },
    {
      href: "/admin/accounts",
      label: "アカウント管理",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/admin/admins",
      label: "管理者管理",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      href: "/admin/analytics",
      label: "分析",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      href: "/admin/settings",
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
              <Link href="/admin" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                <Shield className="h-6 w-6" />
                <span>管理者パネル</span>
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
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span className="hidden md:inline-block">管理者パネル</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
            ダッシュボードに戻る
          </Link>
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

