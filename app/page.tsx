"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Coins, Trophy, Users, Zap } from "lucide-react"
import TournamentCountdown from "@/components/tournament-countdown"
import SponsorSection from "@/components/sponsor-section"
import PromotionBanner from "@/components/promotion-banner"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import GameDemo from "@/components/game-demo"
import { useSearchParams } from "next/navigation"
import { processReferral } from "@/lib/firebase-utils"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("ref")

  useEffect(() => {
    // Process referral if user came from a referral link
    const handleReferral = async () => {
      if (referralCode && user) {
        try {
          await processReferral(user.uid, referralCode)
        } catch (error) {
          console.error("Error processing referral:", error)
        }
      }
    }

    if (referralCode && user) {
      handleReferral()
    }
  }, [referralCode, user])

  const handlePlayNow = () => {
    if (!user) {
      // If not logged in, redirect to auth page
      router.push("/auth?redirectTo=/tournament")
      toast({
        title: "Authentication Required",
        description: "Please sign in to play the tournament",
      })
    } else {
      // If logged in, redirect to tournament page
      router.push("/tournament")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative py-20 mb-16 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 z-0"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-20 z-[-1]"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">DINO</span>{" "}
            Tournament
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Compete in our 15-day tournament and win from a massive prize pool of
            <span className="font-bold text-green-400"> 615,500 USDT</span> +
            <span className="font-bold text-blue-400"> 61,550 DINO Coins</span>!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handlePlayNow}
              className="text-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              Play Now
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg border-white/20 hover:bg-white/10">
              <Link href="/tournament">Tournament Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Game Demo Section */}
      {!user && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Try the Game</h2>
          <GameDemo />
        </section>
      )}

      {/* Promotion Banner */}
      <PromotionBanner />

      {/* Tournament Countdown */}
      <TournamentCountdown />

      {/* Tournament Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Trophy className="h-8 w-8 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Mini Tournament</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Entry Fee: <span className="font-bold text-green-400">1 USDT</span>
            </p>
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 text-purple-300">Prize Pool:</h3>
              <p className="text-2xl font-bold text-white">10,500 USDT + 1,050 DINO</p>
            </div>
            <div className="space-y-2 text-gray-300">
              <p>🏆 Rank 1: 1,000 USDT + 100 DINO</p>
              <p>🥈 Rank 2: 900 USDT + 90 DINO</p>
              <p>🥉 Rank 3: 800 USDT + 80 DINO</p>
              <p>And many more prizes!</p>
            </div>
            <Button
              onClick={() => {
                if (!user) {
                  router.push("/auth?redirectTo=/tournament?type=mini")
                  toast({
                    title: "Authentication Required",
                    description: "Please sign in to join the tournament",
                  })
                } else {
                  router.push("/tournament?type=mini")
                }
              }}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
            >
              Join Mini Tournament
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border-indigo-700/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Trophy className="h-8 w-8 text-indigo-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Grand Tournament</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Entry Fee: <span className="font-bold text-green-400">10 USDT</span>
            </p>
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 text-indigo-300">Prize Pool:</h3>
              <p className="text-2xl font-bold text-white">605,000 USDT + 60,500 DINO</p>
            </div>
            <div className="space-y-2 text-gray-300">
              <p>🏆 Rank 1: 100,000 USDT + 10,000 DINO</p>
              <p>🥈 Rank 2: 90,000 USDT + 9,000 DINO</p>
              <p>🥉 Rank 3: 80,000 USDT + 8,000 DINO</p>
              <p>And many more prizes!</p>
            </div>
            <Button
              onClick={() => {
                if (!user) {
                  router.push("/auth?redirectTo=/tournament?type=grand")
                  toast({
                    title: "Authentication Required",
                    description: "Please sign in to join the tournament",
                  })
                } else {
                  router.push("/tournament?type=grand")
                }
              }}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
            >
              Join Grand Tournament
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Tournament Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-background/50 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Massive Prizes</h3>
              <p className="text-gray-400">Win from a total prize pool of over 615,500 USDT + 61,550 DINO Coins</p>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Power Boosters</h3>
              <p className="text-gray-400">
                Purchase boosters to multiply your scores and increase your chances of winning
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Referral System</h3>
              <p className="text-gray-400">Earn 1 USDT for each valid referral who joins the tournament</p>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">DINO Coins</h3>
              <p className="text-gray-400">Win exclusive DINO cryptocurrency tokens with future listing potential</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sponsors Section */}
      <SponsorSection />
    </div>
  )
}
