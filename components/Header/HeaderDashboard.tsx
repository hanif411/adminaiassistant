"use client";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

function HeaderDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const handleLogout = () => {
    supabase.auth.signOut();
    router.push("/login");
  };
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <Link href="/purchases" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📦</span>
            </div>
            <div className="hidden md:inline-block">
              <h1 className="text-xl  text-gray-900">Admin AI Assistant</h1>
              <p className="text-xs text-gray-500">Efisiensi Data Entry</p>
            </div>
          </Link>
          <div>
            <Button variant={"link"}>
              <Link href={"/purchases"}>Pembelian</Link>
            </Button>
            <Button variant={"link"}>
              <Link href={"/sales"}>Penjualan</Link>
            </Button>
            <Button variant={"link"}>
              <Link href={"/stockopname"}>Stock Opname</Link>
            </Button>
          </div>

          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderDashboard;
