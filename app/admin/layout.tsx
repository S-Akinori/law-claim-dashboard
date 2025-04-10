import DashboardLayout from "@/components/admin-layout"

export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <DashboardLayout>{children}</DashboardLayout>
  }