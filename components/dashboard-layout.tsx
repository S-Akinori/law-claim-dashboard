import type React from "react"

import Link from "next/link"
import {
  MessageSquare,
  Image,
} from "lucide-react"
import LogoutButton from "./logout-button"
import { createClient } from "@/lib/supabase/server"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {

  const supabase = await createClient()

  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error("User error:", userError)
  }
  if (!user) {
    console.error("User not found")
    return <p>User not found</p>
  }
  if (!user.user) {
    console.error("User not found")
    return <p>User not found</p>
  }
  const { data: accountData, error: accountError } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.user.id)
    .single()

  const routes = accountData?.use_master ? [
    {
      href: "/dashboard/line-users",
      label: "ユーザリスト",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ] : [
    // {
    //   href: "/dashboard/account",
    //   label: "アカウント管理",
    //   icon: <MessageSquare className="h-5 w-5" />,
    // },
    {
      href: "/dashboard/line-users",
      label: "ユーザリスト",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    // {
    //   href: "/dashboard/questions",
    //   label: "質問管理",
    //   icon: <MessageSquare className="h-5 w-5" />,
    // },
    // {
    //   href: "/dashboard/images",
    //   label: "画像管理",
    //   icon: <Image className="h-5 w-5" />,
    // },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-6 w-6" />
          <span className="hidden md:inline-block">交通事故慰謝料計算</span>
        </Link>
        <LogoutButton />
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4">
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

