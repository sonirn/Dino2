"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { Menu, Trophy, Gamepad2, User, Wallet, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: <Trophy className="h-5 w-5 mr-2" /> },
  { name: "Game", href: "/game", icon: <Gamepad2 className="h-5 w-5 mr-2" /> },
  { name: "Tournament", href: "/tournament", icon: <Trophy className="h-5 w-5 mr-2" /> },
  { name: "Profile", href: "/profile", icon: <User className="h-5 w-5 mr-2" /> },
]

export default function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleAuthClick = () => {
    router.push("/auth")
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              DINO
            </span>
            <span className="font-semibold hidden md:inline-block">Tournament</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {user && (
              <Link href="/profile" className="flex items-center">
                <Button variant="outline" size="sm" className="mr-2">
                  <Wallet className="h-4 w-4 mr-2" />
                  Balance
                </Button>
              </Link>
            )}

            {!user ? (
              <Button onClick={() => router.push("/auth")} variant="default" size="sm">
                Sign In / Sign Up
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium">{user.email?.split("@")[0]}</div>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end md:hidden">
          {user && (
            <Link href="/profile" className="mr-4">
              <Button variant="outline" size="sm">
                <Wallet className="h-4 w-4 mr-2" />
                Balance
              </Button>
            </Link>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-6 mt-8">
                <nav className="flex flex-col space-y-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {!user ? (
                  <Button onClick={handleAuthClick} variant="default" className="w-full">
                    Sign In / Sign Up
                  </Button>
                ) : (
                  <div className="pt-4 border-t">
                    <div className="mb-4 text-sm font-medium">Signed in as: {user.email}</div>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
