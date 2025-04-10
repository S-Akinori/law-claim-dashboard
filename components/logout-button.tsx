'use client'
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("ログアウトエラー:", error)
    } else {
      router.push("/login")
    }
  }

  return (
    <Button onClick={handleLogout} variant="ghost">
      <LogOut className="h-5 w-5" />
      ログアウト
    </Button>
  )
}
