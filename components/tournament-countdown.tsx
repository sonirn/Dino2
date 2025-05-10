"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default function TournamentCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [tournamentPhase, setTournamentPhase] = useState("")
  const [endDate, setEndDate] = useState<Date>(new Date())

  useEffect(() => {
    // Calculate tournament end date (15 days from start)
    const calculateEndDate = () => {
      const now = new Date()
      const currentDay = now.getDate()
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

      let end: Date

      // First half of month tournament (days 1-15)
      if (currentDay <= 15) {
        end = new Date(now.getFullYear(), now.getMonth(), 15, 23, 59, 59)
        setTournamentPhase("First Half")
      }
      // Second half of month tournament (days 16-end)
      else {
        end = new Date(now.getFullYear(), now.getMonth(), lastDayOfMonth, 23, 59, 59)
        setTournamentPhase("Second Half")
      }

      setEndDate(end)
      return end
    }

    const endDate = calculateEndDate()

    // Update countdown timer
    const timer = setInterval(() => {
      const now = new Date()
      const difference = endDate.getTime() - now.getTime()

      if (difference <= 0) {
        // Tournament ended, recalculate for next tournament
        clearInterval(timer)
        calculateEndDate()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Tournament Countdown</CardTitle>
        </div>
        <CardDescription>{tournamentPhase} Tournament ends in:</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{timeLeft.days}</span>
            <span className="text-xs text-muted-foreground">Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{timeLeft.hours}</span>
            <span className="text-xs text-muted-foreground">Hours</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{timeLeft.minutes}</span>
            <span className="text-xs text-muted-foreground">Minutes</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{timeLeft.seconds}</span>
            <span className="text-xs text-muted-foreground">Seconds</span>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Next tournament starts immediately after this one ends
        </p>
      </CardContent>
    </Card>
  )
}
