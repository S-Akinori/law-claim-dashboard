import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { redirect, usePathname, useRouter } from "next/navigation"
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
import { createClient } from "@/lib/supabase/server"
import LogoutButton from "./logout-button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {

  const routes = [
    {
      href: "/admin/accounts/new",
      label: "ユーザー登録",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/admin/questions",
      label: "質問管理",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/admin/actions",
      label: "アクション設定",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/admin/routes",
      label: "質問ルート",
      icon: <ArrowRight className="h-5 w-5" />,
    },
    {
      href: "/admin/triggers",
      label: "スタートトリガー",
      icon: <Play className="h-5 w-5" />,
    },
    {
      href: "/admin/scheduled-messages",
      label: "定期メッセージ",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      href: "/admin/email-templates",
      label: "メールテンプレート",
      icon: <Mail className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-6 w-6" />
          <span className="hidden md:inline-block">交通事故慰謝料計算</span>
        </Link>
        <LogoutButton />
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4">
            <p className="font-bold">マスタ編集</p>
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted `}
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

