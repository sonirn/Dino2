"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getFullLeaderboard } from "@/lib/firebase-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  avatar?: string
  updatedAt?: any
}

interface TournamentLeaderboardProps {
  type: "mini" | "grand"
  data: LeaderboardEntry[]
  showSearch?: boolean
  showTabs?: boolean
  userId?: string
}

export default function TournamentLeaderboard({
  type,
  data,
  showSearch = false,
  showTabs = false,
  userId = "",
}: TournamentLeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(data)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [fullLeaderboard, setFullLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<"mini" | "grand">(type)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const { toast } = useToast()

  useEffect(() => {
    // Update leaderboard data when props change
    setLeaderboardData(data)
  }, [data])

  useEffect(() => {
    // Load full leaderboard if search is enabled
    if (showSearch) {
      loadFullLeaderboard()

      // Set up auto-refresh every 60 seconds
      const interval = setInterval(() => {
        loadFullLeaderboard()
      }, 60000)

      setRefreshInterval(interval)
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, showSearch])

  const loadFullLeaderboard = async () => {
    try {
      setLoading(true)
      const fullData = await getFullLeaderboard(activeTab)
      setFullLeaderboard(fullData)
      setLastUpdated(new Date())
      setLoading(false)
    } catch (error) {
      console.error("Error loading full leaderboard:", error)
      setLoading(false)
      toast({
        title: "Error Loading Leaderboard",
        description: "Failed to load the latest leaderboard data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter leaderboard based on search term
  const filteredLeaderboard =
    searchTerm.trim() !== "" && fullLeaderboard.length > 0
      ? fullLeaderboard.filter((entry) => entry.username.toLowerCase().includes(searchTerm.toLowerCase()))
      : leaderboardData

  // If no data, show placeholder
  const displayData =
    filteredLeaderboard.length > 0
      ? filteredLeaderboard
      : Array(5)
          .fill(null)
          .map((_, i) => ({
            rank: i + 1,
            userId: `placeholder-${i}`,
            username: "Player",
            score: 0,
          }))

  // Find user's position in leaderboard
  const userPosition = userId ? fullLeaderboard.findIndex((entry) => entry.userId === userId) : -1

  const renderLeaderboard = (data: LeaderboardEntry[]) => (
    <div className="space-y-4">
      {data.slice(0, showSearch ? undefined : 10).map((entry) => (
        <div
          key={entry.userId}
          className={`flex items-center p-3 rounded-lg ${
            entry.userId === userId
              ? "bg-green-900/20 border border-green-700/30"
              : entry.rank === 1
                ? "bg-yellow-900/20 border border-yellow-700/30"
                : entry.rank === 2
                  ? "bg-gray-800/50 border border-gray-700/30"
                  : entry.rank === 3
                    ? "bg-amber-900/20 border border-amber-700/30"
                    : "bg-background/50 border border-gray-700/20"
          }`}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 mr-4">
            {entry.rank === 1 ? (
              <Trophy className="h-5 w-5 text-yellow-400" />
            ) : entry.rank === 2 ? (
              <Medal className="h-5 w-5 text-gray-400" />
            ) : entry.rank === 3 ? (
              <Medal className="h-5 w-5 text-amber-600" />
            ) : (
              <span className="font-bold">{entry.rank}</span>
            )}
          </div>

          <div className="flex-1">
            <p className="font-medium">
              {entry.username}
              {entry.userId === userId && <span className="text-green-400 ml-2">(You)</span>}
            </p>
            <p className="text-sm text-gray-400">{data.length > 0 ? `Score: ${entry.score}` : "No score yet"}</p>
          </div>

          {data.length === 0 && (
            <div className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400">Waiting for players</div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div>
      {showTabs ? (
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "mini" | "grand")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="mini">Mini Tournament</TabsTrigger>
            <TabsTrigger value="grand">Grand Tournament</TabsTrigger>
          </TabsList>

          <TabsContent value="mini">
            {showSearch && (
              <div className="flex items-center mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search players..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="ml-2" onClick={() => setSearchTerm("")}>
                  Clear
                </Button>
                <Button variant="outline" size="sm" className="ml-2" onClick={loadFullLeaderboard} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>
            )}
            {renderLeaderboard(displayData)}
            {showSearch && (
              <p className="text-xs text-gray-400 mt-4 text-right">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </TabsContent>

          <TabsContent value="grand">
            {showSearch && (
              <div className="flex items-center mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search players..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="ml-2" onClick={() => setSearchTerm("")}>
                  Clear
                </Button>
                <Button variant="outline" size="sm" className="ml-2" onClick={loadFullLeaderboard} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>
            )}
            {renderLeaderboard(displayData)}
            {showSearch && (
              <p className="text-xs text-gray-400 mt-4 text-right">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <h3 className="text-xl font-bold mb-4">
            {type === "mini" ? "Mini Tournament" : "Grand Tournament"} Leaderboard
          </h3>

          {showSearch && (
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search players..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="ml-2" onClick={() => setSearchTerm("")}>
                Clear
              </Button>
              <Button variant="outline" size="sm" className="ml-2" onClick={loadFullLeaderboard} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>
          )}

          {renderLeaderboard(displayData)}

          {/* Show user's position if not in top 10 */}
          {userId && userPosition > 9 && fullLeaderboard.length > 0 && (
            <Card className="mt-6 bg-green-900/20 border-green-700/30">
              <CardHeader>
                <CardTitle className="text-sm">Your Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 mr-4">
                    <span className="font-bold">{userPosition + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {fullLeaderboard[userPosition].username} <span className="text-green-400">(You)</span>
                    </p>
                    <p className="text-sm text-gray-400">Score: {fullLeaderboard[userPosition].score}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showSearch && (
            <p className="text-xs text-gray-400 mt-4 text-right">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </>
      )}
    </div>
  )
}
