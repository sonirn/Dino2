"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Calendar, Medal } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface TournamentHistoryProps {
  tournaments: any[]
}

export default function TournamentHistory({ tournaments }: TournamentHistoryProps) {
  // Sort tournaments by date (newest first)
  const sortedTournaments = [...(tournaments || [])].sort((a, b) => {
    return b.endDate?.seconds - a.endDate?.seconds
  })

  if (sortedTournaments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">You haven't participated in any tournaments yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-primary mr-2" />
              <p className="text-sm text-gray-400">Total Tournaments</p>
            </div>
            <p className="text-3xl font-bold">{sortedTournaments.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Medal className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-gray-400">Best Rank</p>
            </div>
            <p className="text-3xl font-bold">{Math.min(...sortedTournaments.map((t) => t.rank || 999))}</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-blue-400 mr-2" />
              <p className="text-sm text-gray-400">Active Tournaments</p>
            </div>
            <p className="text-3xl font-bold">{sortedTournaments.filter((t) => t.status === "active").length}</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-3">Tournament History</h3>

      <div className="space-y-3">
        {sortedTournaments.map((tournament, index) => {
          // Convert Firebase timestamp to Date
          const startDate = tournament.startDate?.toDate
            ? tournament.startDate.toDate()
            : new Date(tournament.startDate?.seconds * 1000)

          const endDate = tournament.endDate?.toDate
            ? tournament.endDate.toDate()
            : new Date(tournament.endDate?.seconds * 1000)

          return (
            <Card key={index} className="bg-background/50 border-primary/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        tournament.type === "mini" ? "bg-purple-900/30" : "bg-indigo-900/30"
                      }`}
                    >
                      <Trophy
                        className={`h-5 w-5 ${tournament.type === "mini" ? "text-purple-400" : "text-indigo-400"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {tournament.type === "mini" ? "Mini Tournament" : "Grand Tournament"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(startDate)} - {formatDate(endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        tournament.status === "active"
                          ? "bg-green-900/30 text-green-400"
                          : tournament.status === "completed"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-gray-800/50 text-gray-400"
                      }`}
                    >
                      {tournament.status === "active"
                        ? "Active"
                        : tournament.status === "completed"
                          ? "Completed"
                          : "Upcoming"}
                    </span>

                    {tournament.rank && (
                      <div className="mt-1">
                        <p className="text-sm font-medium">Rank: {tournament.rank}</p>
                        <p className="text-xs text-gray-400">Score: {tournament.score}</p>
                      </div>
                    )}

                    {tournament.prize && tournament.prize > 0 && (
                      <p className="text-sm text-green-400 mt-1">
                        Won: {tournament.prize} {tournament.prizeCurrency || "USDT"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
