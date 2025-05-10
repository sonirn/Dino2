import type { Metadata } from "next"
import AuthTabs from "@/components/auth-tabs"

export const metadata: Metadata = {
  title: "Authentication - Dino Tournament",
  description: "Sign in or create an account to participate in Dino Tournament",
}

export default function AuthPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <div className="w-full max-w-md">
        <AuthTabs />
      </div>
    </div>
  )
}
