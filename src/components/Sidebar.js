"use client";

import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut, PackagePlus, X, FolderTree, BookOpen, Images } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ closeMobileMenu }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    { name: "Products", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Add Product", icon: <PackagePlus size={20} />, path: "/dashboard/add" },
    { name: "Categories", icon: <FolderTree size={20} />, path: "/dashboard/categories" },
    { name: "Blogs", icon: <BookOpen size={20} />, path: "/dashboard/blogs" },
    { name: "Hero Banners", icon: <Images size={20} />, path: "/dashboard/banners" },
  ];

  return (
    <div className="w-72 md:w-64 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full z-10 relative">
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
          {closeMobileMenu && (
            <button onClick={closeMobileMenu} className="md:hidden p-2 -mr-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 md:py-2.5 rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`}
              >
                <div className={`${isActive ? "text-blue-600" : "text-gray-400"}`}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="mb-3 px-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Logged in as</p>
          <p className="text-sm font-medium text-gray-700 truncate" title={user?.email}>{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
        >
          <LogOut size={20} className="text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
