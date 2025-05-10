"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getTournamentData } from "@/lib/firebase-utils"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TournamentRegistration from "@/components/tournament-registration"
import TournamentRules from "@/components/tournament-rules"
import TournamentPrizes from "@/components/tournament-prizes"
import TournamentLeaderboard from "@/components/tournament-leaderboard"
import TournamentCountdown from "@/components/tournament-countdown"

// Separate loading component for better code splitting
const TournamentLoading = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Tournament Dashboard</h1>

      <div className="h-24 w-full bg-gray-100 animate-pulse rounded-lg mb-8"></div>

      <div className="h-10 w-full bg-gray-100 animate-pulse rounded-lg mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="h-48 w-full bg-gray-100 animate-pulse rounded-lg mb-8"></div>
          <div className="h-96 w-full bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
        <div>
          <div className="h-96 w-full bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
)

export default function TournamentPage() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("type") || "mini"
  const { toast } = useToast()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState(true)
  const [tournamentData, setTournamentData] = useState<any>(null)
  const [userRegistration, setUserRegistration] = useState<{
    mini: boolean
    grand: boolean
  }>({
    mini: false,
    grand: false,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?redirectTo=/tournament")
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    let isMounted = true

    const fetchTournamentData = async () => {
      if (!authLoading && user && !tournamentData) {
        try {
          setError(null)

          // Fetch tournament data with a timeout
          const data = await getTournamentData(user.uid)

          if (isMounted) {
            setTournamentData(data)
            setUserRegistration({
              mini: data.userRegistration?.mini || false,
              grand: data.userRegistration?.grand || false,
            })
            setLoading(false)
          }
        } catch (error) {
          console.error("Error fetching tournament data:", error)
          if (isMounted) {
            setError("Failed to load tournament data. Please try again later.")
            toast({
              title: "Error",
              description: "Failed to load tournament data. Please try again later.",
              variant: "destructive",
            })
            setLoading(false)
          }
        }
      }
    }

    fetchTournamentData()

    return () => {
      isMounted = false
    }
  }, [user, authLoading, toast, tournamentData])

  const handlePlayGame = (tournamentType: "mini" | "grand") => {
    // Check if user is registered for the selected tournament
    if (
      (tournamentType === "mini" && userRegistration.mini) ||
      (tournamentType === "grand" && userRegistration.grand)
    ) {
      router.push(`/game?type=${tournamentType}`)
    } else {
      toast({
        title: "Registration Required",
        description: `You need to register for the ${tournamentType === "mini" ? "Mini" : "Grand"} Tournament first.`,
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return <TournamentLoading />
  }

  // If user is not registered for any tournament, show registration page
  if (!userRegistration.mini && !userRegistration.grand) {
    return <TournamentRegistration />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Tournament Dashboard</h1>

        {error && (
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-300">{error}</p>
          </div>
        )}

        <Suspense fallback={<div className="h-24 w-full bg-gray-100 animate-pulse rounded-lg mb-8"></div>}>
          <TournamentCountdown />
        </Suspense>

        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "mini" | "grand")}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="mini" disabled={!userRegistration.mini}>
              Mini Tournament
            </TabsTrigger>
            <TabsTrigger value="grand" disabled={!userRegistration.grand}>
              Grand Tournament
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mini">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2">
                <Card className="bg-background/50 border-purple-700/30 mb-8">
                  <CardHeader className="bg-purple-900/20">
                    <CardTitle>Mini Tournament</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="mb-6">
                      Compete in the Mini Tournament for a chance to win from a prize pool of 10,500 USDT + 1,050 DINO!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => handlePlayGame("mini")}
                      >
                        Play Now
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => router.push("/profile?tab=scores")}
                        className="border-purple-700/30"
                      >
                        View My Scores
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Suspense fallback={<div className="h-96 w-full bg-gray-100 animate-pulse rounded-lg"></div>}>
                  <TournamentLeaderboard
                    type="mini"
                    data={tournamentData?.leaderboards?.mini || []}
                    userId={user?.uid}
                  />
                </Suspense>
              </div>

              <div>
                <Suspense fallback={<div className="h-96 w-full bg-gray-100 animate-pulse rounded-lg"></div>}>
                  <TournamentPrizes type="mini" />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grand">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2">
                <Card className="bg-background/50 border-indigo-700/30 mb-8">
                  <CardHeader className="bg-indigo-900/20">
                    <CardTitle>Grand Tournament</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="mb-6">
                      Compete in the Grand Tournament for a chance to win from a massive prize pool of 605,000 USDT +
                      60,500 DINO!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handlePlayGame("grand")}
                      >
                        Play Now
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => router.push("/profile?tab=scores")}
                        className="border-indigo-700/30"
                      >
                        View My Scores
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => router.push("/game#booster-section")}
                        className="border-indigo-700/30"
                      >
                        Buy Boosters
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Suspense fallback={<div className="h-96 w-full bg-gray-100 animate-pulse rounded-lg"></div>}>
                  <TournamentLeaderboard
                    type="grand"
                    data={tournamentData?.leaderboards?.grand || []}
                    userId={user?.uid}
                  />
                </Suspense>
              </div>

              <div>
                <Suspense fallback={<div className="h-96 w-full bg-gray-100 animate-pulse rounded-lg"></div>}>
                  <TournamentPrizes type="grand" />
                </Suspense>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-background/50 border-primary/20">
            <CardHeader>
              <CardTitle>Tournament Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <TournamentRules />
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-primary/20">
            <CardHeader>
              <CardTitle>Registration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background/80">
                  <div>
                    <p className="font-medium">Mini Tournament</p>
                    <p className="text-sm text-gray-400">Entry Fee: 1 USDT</p>
                  </div>
                  {userRegistration.mini ? (
                    <div className="px-3 py-1 rounded-full bg-green-900/20 text-green-400 text-sm">Registered</div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push("/tournament?type=mini")}
                      className="border-purple-700/30"
                    >
                      Register
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-background/80">
                  <div>
                    <p className="font-medium">Grand Tournament</p>
                    <p className="text-sm text-gray-400">Entry Fee: 10 USDT</p>
                  </div>
                  {userRegistration.grand ? (
                    <div className="px-3 py-1 rounded-full bg-green-900/20 text-green-400 text-sm">Registered</div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push("/tournament?type=grand")}
                      className="border-indigo-700/30"
                    >
                      Register
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
