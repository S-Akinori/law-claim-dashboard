import DashboardLayout from "@/components/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex justify-center py-6">
        <p>読み込み中...</p>
      </div>
    </DashboardLayout>
  )
}

