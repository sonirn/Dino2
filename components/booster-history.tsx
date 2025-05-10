"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, Calendar, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface BoosterHistoryProps {
  boosters: any[]
}

export default function BoosterHistory({ boosters }: BoosterHistoryProps) {
  // Sort boosters by purchase date (newest first)
  const sortedBoosters = [...(boosters || [])].sort((a, b) => {
    return b.purchasedAt?.seconds - a.purchasedAt?.seconds
  })

  if (sortedBoosters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">You haven't purchased any boosters yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-gray-400">Active Boosters</p>
            </div>
            <p className="text-3xl font-bold">{sortedBoosters.filter((b) => b.active).length}</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-blue-400 mr-2" />
              <p className="text-sm text-gray-400">Total Purchased</p>
            </div>
            <p className="text-3xl font-bold">{sortedBoosters.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-purple-400 mr-2" />
              <p className="text-sm text-gray-400">Expired Boosters</p>
            </div>
            <p className="text-3xl font-bold">{sortedBoosters.filter((b) => !b.active).length}</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-3">Booster History</h3>

      <div className="space-y-3">
        {sortedBoosters.map((booster, index) => {
          // Convert Firebase timestamp to Date
          const purchaseDate = booster.purchasedAt?.toDate
            ? booster.purchasedAt.toDate()
            : new Date(booster.purchasedAt?.seconds * 1000)

          const expiryDate = booster.expiresAt?.toDate
            ? booster.expiresAt.toDate()
            : booster.expiresAt
              ? new Date(booster.expiresAt?.seconds * 1000)
              : null

          return (
            <Card key={index} className="bg-background/50 border-primary/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        booster.active ? "bg-green-900/30" : "bg-gray-800/50"
                      }`}
                    >
                      <Zap className={`h-5 w-5 ${booster.active ? "text-green-400" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {booster.boosterId === 1
                          ? "Booster 1 (10 games)"
                          : booster.boosterId === 2
                            ? "Booster 2 (100 games)"
                            : "Booster 3 (Unlimited)"}
                      </p>
                      <p className="text-xs text-gray-400">Purchased: {formatDate(purchaseDate)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        booster.active ? "bg-green-900/30 text-green-400" : "bg-gray-800/50 text-gray-400"
                      }`}
                    >
                      {booster.active ? "Active" : "Expired"}
                    </span>

                    {booster.remainingGames !== null && booster.active && (
                      <p className="text-sm mt-1">{booster.remainingGames} games remaining</p>
                    )}

                    {expiryDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        {booster.active ? "Expires" : "Expired"}: {formatDate(expiryDate)}
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
