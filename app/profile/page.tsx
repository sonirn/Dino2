"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getUserProfile, getReferralStats } from "@/lib/firebase-utils"
import { LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ProfileTabs from "@/components/profile-tabs"
import ReferFriends from "@/components/refer-friends"

// Separate loading component for better code splitting
const ProfileLoading = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="md:col-span-2 bg-background/50 border-primary/20">
          <CardHeader>
            <div className="h-7 w-48 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-5 w-64 bg-gray-200 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-primary/20">
          <CardHeader>
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-5 w-48 bg-gray-200 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="h-5 w-36 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              </div>
              <div>
                <div className="h-5 w-28 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
              </div>
              <div>
                <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
                <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mt-1"></div>
              </div>
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [referralStats, setReferralStats] = useState({
    total: 0,
    valid: 0,
    pending: 0,
    earnings: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?redirectTo=/profile")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    let isMounted = true

    const fetchProfileData = async () => {
      if (user) {
        try {
          // Fetch user profile with a timeout
          const profilePromise = getUserProfile(user.uid)
          const statsPromise = getReferralStats(user.uid)

          // Use Promise.all to fetch data in parallel
          const [profileData, statsData] = await Promise.all([profilePromise, statsPromise])

          if (isMounted) {
            setProfile(profileData)
            setReferralStats(statsData.stats)
            setLoading(false)
          }
        } catch (error) {
          console.error("Error fetching profile data:", error)
          if (isMounted) {
            toast({
              title: "Error",
              description: "Failed to load profile data. Please try again.",
              variant: "destructive",
            })
            setLoading(false)
          }
        }
      }
    }

    if (user && !profile) {
      fetchProfileData()
    }

    return () => {
      isMounted = false
    }
  }, [user, toast, profile])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return <ProfileLoading />
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="md:col-span-2 bg-background/50 border-primary/20">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details and referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ""} disabled className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.displayName || user.email?.split("@")[0] || ""}
                    disabled
                    className="bg-background/50"
                  />
                </div>

                <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-primary/20">
            <CardHeader>
              <CardTitle>Balance</CardTitle>
              <CardDescription>Your tournament earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Available Balance</p>
                  <p className="text-3xl font-bold">{profile.balance?.available || 0} USDT</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">DINO Tokens</p>
                  <p className="text-3xl font-bold">{profile.balance?.dino || 0} DINO</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Referral Balance</p>
                  <p className="text-xl font-semibold">{profile.balance?.referral || 0} USDT</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Transferred to main balance after tournament ends (min. 10 USDT)
                  </p>
                </div>

                <Button
                  className="w-full"
                  disabled={!profile.balance?.available && !profile.balance?.dino}
                  onClick={() => router.push("/profile?tab=withdrawals")}
                >
                  Withdraw Funds
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <Suspense fallback={<div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg"></div>}>
              <ProfileTabs profile={profile} />
            </Suspense>
          </div>

          <div>
            <Suspense fallback={<div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg"></div>}>
              <ReferFriends referralCode={profile.referralCode || ""} referralStats={referralStats} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
