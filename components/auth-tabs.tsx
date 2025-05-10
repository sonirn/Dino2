"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <Tabs defaultValue="login" className="w-full max-w-md mx-auto" value={activeTab} onValueChange={setActiveTab}>
      <Card>
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <CardTitle className="text-2xl mt-4">{activeTab === "login" ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription>
            {activeTab === "login" ? "Sign in to your account to continue" : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TabsContent value="login" className="mt-0">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-0">
            <SignupForm />
          </TabsContent>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {activeTab === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("signup")}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </Tabs>
  )
}
