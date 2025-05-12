import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
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

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "アカウント管理 - 管理パネル",
    description: "アカウント管理アプリケーション",
}

export default async function AccountLayout({ children, params }: {
    children: React.ReactNode
    params: {
        id: string
    }
}) {
    const supabase = await createClient()
    const { id } = params
    const { data: account } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single()

    const routes = [
        {
            href: `/admin/accounts/${account.id}/questions`,
            label: "質問管理",
            icon: <MessageSquare className="h-5 w-5" />,
        },
        {
            href: `/admin/accounts/${account.id}/actions`,
            label: "アクション管理",
            icon: <MessageSquare className="h-5 w-5" />,
        },
        {
            href: `/admin/accounts/${account.id}/routes`,
            label: "質問ルート",
            icon: <ArrowRight className="h-5 w-5" />,
        },
        {
            href: `/admin/accounts/${account.id}/triggers`,
            label: "スタートトリガー",
            icon: <Play className="h-5 w-5" />,
        },
        {
            href: `/admin/accounts/${account.id}/scheduled-messages`,
            label: "定期メッセージ",
            icon: <Clock className="h-5 w-5" />,
        },
        {
            href: `/admin/accounts/${account.id}/email-templates`,
            label: "メールテンプレート",
            icon: <Mail className="h-5 w-5" />,
        },
    ]


    return (
        <div>
            <div className="mb-4">
                <div className="font-bold mb-4"><Link href={`/admin/accounts/${id}`} className="underline">アカウント：{account?.name}</Link></div>
                <ul className="flex gap-4">
                    {routes.map((route) => (
                        <li key={route.href}>
                            <Link href={route.href} className="flex items-center">
                                {route.icon}
                                {route.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            {children}
        </div>
    )
}
