"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import DinoGame from "@/components/dino-game"
import { checkTournamentEligibility } from "@/lib/tournament-utils"
import { saveScore } from "@/lib/firebase-utils"
import { Loader2, Zap, AlertCircle } from "lucide-react"
import TournamentRegistration from "@/components/tournament-registration"
import BoosterPurchase from "@/components/booster-purchase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Separate loading component for better code splitting
const GameLoading = () => (
  <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-xl">Loading game...</p>
  </div>
)

export default function GamePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [eligibility, setEligibility] = useState<{
    mini: boolean
    grand: boolean
    loading: boolean
  }>({
    mini: false,
    grand: false,
    loading: true,
  })
  const [boosterActive, setBoosterActive] = useState<{
    active: boolean
    multiplier: number
    remainingGames: number | null
  }>({
    active: false,
    multiplier: 1,
    remainingGames: null,
  })
  const [showBoosterReminder, setShowBoosterReminder] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to play the game",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [user, loading, router, toast])

  useEffect(() => {
    let isMounted = true

    const checkEligibility = async () => {
      if (user) {
        try {
          const eligibilityData = await checkTournamentEligibility(user.uid)

          if (isMounted) {
            setEligibility({
              mini: eligibilityData.mini,
              grand: eligibilityData.grand,
              loading: false,
            })

            // Check for active boosters
            if (eligibilityData.booster) {
              setBoosterActive({
                active: true,
                multiplier: eligibilityData.booster.multiplier || 2, // Default to 2x
                remainingGames: eligibilityData.booster.remainingGames,
              })
            } else {
              setBoosterActive({
                active: false,
                multiplier: 1,
                remainingGames: null,
              })

              // Show booster reminder if eligible for grand tournament but no booster
              if (eligibilityData.grand && Math.random() > 0.5) {
                setShowBoosterReminder(true)
              }
            }

            // Get user's high score
            if (eligibilityData.highScore) {
              setHighScore(eligibilityData.highScore)
            }
          }
        } catch (error) {
          console.error("Error checking eligibility:", error)
          if (isMounted) {
            setEligibility({
              mini: false,
              grand: false,
              loading: false,
            })
          }
        }
      }
    }

    checkEligibility()

    return () => {
      isMounted = false
    }
  }, [user, refreshTrigger])

  const handleGameStart = () => {
    setGameStarted(true)
    setScore(0)
  }

  const handleGameOver = async (finalScore: number) => {
    setGameStarted(false)

    // Apply booster if active
    let adjustedScore = finalScore
    if (boosterActive.active) {
      adjustedScore = finalScore * boosterActive.multiplier

      // Update remaining games for limited boosters
      if (boosterActive.remainingGames !== null) {
        const remaining = boosterActive.remainingGames - 1
        if (remaining <= 0) {
          setBoosterActive({
            active: false,
            multiplier: 1,
            remainingGames: null,
          })
          // Show booster reminder after using last booster
          setShowBoosterReminder(true)
        } else {
          setBoosterActive({
            ...boosterActive,
            remainingGames: remaining,
          })
        }
      }
    }

    setScore(adjustedScore)

    // Update high score if needed
    if (adjustedScore > highScore) {
      setHighScore(adjustedScore)
    }

    // Save score to database
    if (user) {
      try {
        await saveScore(user.uid, adjustedScore, {
          mini: eligibility.mini,
          grand: eligibility.grand,
          boosterApplied: boosterActive.active,
          boosterMultiplier: boosterActive.multiplier,
        })

        toast({
          title: "Score Saved!",
          description: `Your score of ${adjustedScore} has been recorded.`,
        })
      } catch (error) {
        console.error("Error saving score:", error)
        toast({
          title: "Error Saving Score",
          description: "There was a problem saving your score. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleBoosterPurchaseComplete = () => {
    // Refresh eligibility data to get updated booster info
    setRefreshTrigger((prev) => prev + 1)
    setShowBoosterReminder(false)
  }

  if (loading || eligibility.loading) {
    return <GameLoading />
  }

  if (!eligibility.mini && !eligibility.grand) {
    return <TournamentRegistration />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-background/50 border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <img src="/images/100-error-offline.png" alt="Dino" className="h-8 w-8 mr-2" />
              Dino Runner
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div>
                <p className="text-gray-400">Jump over obstacles and set a high score to win in the tournament!</p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-gray-400">Current High Score</p>
                <p className="text-2xl font-bold">{highScore}</p>
              </div>
            </div>

            {boosterActive.active && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-6">
                <p className="text-green-400 font-medium flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Booster Active: {boosterActive.multiplier}x Score Multiplier
                  {boosterActive.remainingGames !== null && (
                    <span className="ml-2 text-sm">({boosterActive.remainingGames} games remaining)</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex justify-center mb-6">
              <Suspense fallback={<div className="h-96 w-full bg-gray-100 animate-pulse rounded-lg"></div>}>
                <DinoGame
                  onGameOver={handleGameOver}
                  boosterActive={boosterActive.active}
                  boosterMultiplier={boosterActive.multiplier}
                />
              </Suspense>
            </div>

            {!gameStarted && (
              <div className="text-center mt-4">
                <p className="mb-4 text-lg">
                  You are eligible for:
                  {eligibility.mini && <span className="ml-2 text-purple-400 font-medium">Mini Tournament</span>}
                  {eligibility.mini && eligibility.grand && <span className="mx-2">&</span>}
                  {eligibility.grand && <span className="text-indigo-400 font-medium">Grand Tournament</span>}
                </p>
                {score > 0 && (
                  <div className="mb-4">
                    <p className="text-xl mb-2">Your last score:</p>
                    <p className="text-4xl font-bold text-primary">{score}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Only show booster purchase section for Grand Tournament participants */}
        {eligibility.grand && (
          <BoosterPurchase userId={user?.uid || ""} onPurchaseComplete={handleBoosterPurchaseComplete} />
        )}
      </div>

      {/* Booster Reminder Dialog */}
      <Dialog open={showBoosterReminder} onOpenChange={setShowBoosterReminder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Boost Your Score!</DialogTitle>
            <DialogDescription>
              Want to climb the leaderboard faster? Purchase a booster to multiply your score!
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-yellow-300">
              Players with boosters are 5x more likely to reach the top 10 on the leaderboard!
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowBoosterReminder(false)}>
              Maybe Later
            </Button>
            <Button
              className="bg-gradient-to-r from-green-500 to-blue-500"
              onClick={() => {
                setShowBoosterReminder(false)
                // Scroll to booster section
                document.querySelector("#booster-section")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <Zap className="mr-2 h-4 w-4" />
              View Boosters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
