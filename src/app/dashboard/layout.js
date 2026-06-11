import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden text-black">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
