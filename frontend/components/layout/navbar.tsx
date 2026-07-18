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
import { SearchBar } from "@/features/search/search-bar";

export function Navbar() {
  const pathname = usePathname();
  const { user, signInWithGoogle, logout } = useAuth();
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
          <Link href="/">
            <Button variant="ghost" size="sm" className="hidden rounded-full md:inline-flex">
              View all listings
            </Button>
          </Link>
          {user && (
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
                <div className="absolute right-0 z-50 mt-2 w-72 max-h-[80vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white py-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
                  {user && (
                    <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                      <p className="mt-1 text-xs capitalize text-neutral-500">Role: {user.role}</p>
                    </div>
                  )}
                  <nav className="py-2">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => setMenuOpen(false)}>
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link href="/trips" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => setMenuOpen(false)}>
                      <Plane className="h-4 w-4" /> My Trips
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => setMenuOpen(false)}>
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                    <Link href="/host" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900" onClick={() => setMenuOpen(false)}>
                      <User className="h-4 w-4" /> My Listings
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-2 text-neutral-400">
                      <User className="h-4 w-4" /> Identity Verification (Coming Soon)
                    </div>
                  </nav>
                  {user ? (
                    <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-red-600 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D70466]"
                        onClick={() => {
                          signInWithGoogle();
                          setMenuOpen(false);
                        }}
                      >
                        Sign in with Google
                      </button>
                    </div>
                  )}
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
