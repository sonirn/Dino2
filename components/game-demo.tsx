"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DinoGame from "@/components/dino-game"
import { useToast } from "@/hooks/use-toast"

export default function GameDemo() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const { toast } = useToast()

  const handleGameStart = () => {
    setGameStarted(true)
    setScore(0)
  }

  const handleGameOver = (finalScore: number) => {
    setGameStarted(false)
    setScore(finalScore)

    toast({
      title: "Game Over!",
      description: `You scored ${finalScore} points. Sign up to compete in the tournament!`,
    })
  }

  return (
    <Card className="bg-background/50 border-primary/20">
      <CardHeader>
        <CardTitle>Try the Dino Runner Game</CardTitle>
      </CardHeader>
      <CardContent>
        {!gameStarted ? (
          <div className="text-center py-8">
            {score > 0 && (
              <div className="mb-8">
                <p className="text-xl mb-2">Your last score:</p>
                <p className="text-4xl font-bold text-primary">{score}</p>
              </div>
            )}
            <p className="mb-6 text-gray-400">
              Try the game before signing up! This is a demo version and scores won't be saved to the leaderboard.
            </p>
            <Button
              size="lg"
              onClick={handleGameStart}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg px-8"
            >
              Start Demo Game
            </Button>
          </div>
        ) : (
          <DinoGame onGameOver={handleGameOver} />
        )}
      </CardContent>
    </Card>
  )
}
