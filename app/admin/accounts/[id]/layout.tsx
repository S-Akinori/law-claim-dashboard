import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

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

    return (
        <div>
            <div className="font-bold"><Link href={`/admin/accounts/${id}`} className="underline">アカウント：{account?.name}</Link></div>
            {children}
        </div>
    )
}
