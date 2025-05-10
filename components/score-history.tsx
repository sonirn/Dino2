"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Score {
  id: string
  score: number
  timestamp: any // Firebase timestamp
  tournamentType: "mini" | "grand" | null
  boosterApplied: boolean
}

interface ScoreHistoryProps {
  scores: Score[]
}

export default function ScoreHistory({ scores }: ScoreHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Sort scores by timestamp (newest first)
  const sortedScores = [...scores].sort((a, b) => {
    return b.timestamp?.seconds - a.timestamp?.seconds
  })

  const totalPages = Math.ceil(sortedScores.length / itemsPerPage)
  const currentScores = sortedScores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (scores.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No scores recorded yet. Play the game to see your history!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {currentScores.map((score) => {
          // Convert Firebase timestamp to Date
          const date = score.timestamp?.toDate ? score.timestamp.toDate() : new Date(score.timestamp?.seconds * 1000)

          return (
            <Card key={score.id} className="bg-background/50 border-primary/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{score.score}</p>
                    <p className="text-xs text-gray-400">
                      {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="text-right">
                    {score.tournamentType && (
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          score.tournamentType === "mini"
                            ? "bg-purple-900/30 text-purple-400"
                            : "bg-indigo-900/30 text-indigo-400"
                        }`}
                      >
                        {score.tournamentType === "mini" ? "Mini" : "Grand"}
                      </span>
                    )}

                    {score.boosterApplied && (
                      <span className="inline-block ml-2 px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400">
                        Boosted
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>

          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
