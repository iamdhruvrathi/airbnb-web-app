"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Heart,
  Home,
  Menu,
  Plane,
  Plus,
  User,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/features/search/search-bar";

export function Navbar() {
  const pathname = usePathname();
  const { user, users, switchUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const hideSearch = pathname.startsWith("/listings/") && pathname.split("/").length > 2;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[#FF385C]">
          <Home className="h-7 w-7" />
          <span className="hidden text-xl font-bold tracking-tight text-[#FF385C] sm:inline">airbnb</span>
        </Link>

        {!hideSearch && (
          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar compact />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {user?.role === "host" && (
            <Link href="/host/listings/new">
              <Button variant="ghost" size="sm" className="hidden rounded-full md:inline-flex">
                <Plus className="h-4 w-4" />
                Create listing
              </Button>
            </Link>
          )}

          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
          </Link>

          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full border-neutral-300 pl-3 pr-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="h-4 w-4" />
              <Avatar className="h-7 w-7">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} />}
                <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
            </Button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white py-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
                  {user && (
                    <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                      <p className="mt-1 text-xs capitalize text-neutral-500">Role: {user.role}</p>
                    </div>
                  )}
                  <nav className="py-2">
                    <Link href="/trips" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => setMenuOpen(false)}>
                      <Plane className="h-4 w-4" /> My Trips
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => setMenuOpen(false)}>
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                    {user?.role === "host" && (
                      <Link href="/host" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => setMenuOpen(false)}>
                        <User className="h-4 w-4" /> Host Dashboard
                      </Link>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 text-neutral-400">
                      <User className="h-4 w-4" /> Identity Verification (Coming Soon)
                    </div>
                  </nav>
                  <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Switch user (mock auth)</p>
                    <div className="space-y-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900",
                            user?.id === u.id && "bg-neutral-100 dark:bg-neutral-900"
                          )}
                          onClick={() => {
                            switchUser(u.id);
                            setMenuOpen(false);
                          }}
                        >
                          <Avatar className="h-6 w-6">
                            {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.name} />}
                            <AvatarFallback>{u.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{u.name}</span>
                          <span className="ml-auto text-xs capitalize text-neutral-500">{u.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-neutral-200 px-4 py-2 dark:border-neutral-800">
                    <button className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Globe className="h-4 w-4" /> English · USD
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!hideSearch && (
        <div className="border-t border-neutral-200 px-4 py-3 md:hidden dark:border-neutral-800">
          <SearchBar compact />
        </div>
      )}
    </header>
  );
}
