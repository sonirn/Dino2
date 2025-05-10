import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Gift } from "lucide-react"

interface TournamentPrizesProps {
  type: "mini" | "grand"
}

export default function TournamentPrizes({ type }: TournamentPrizesProps) {
  const miniPrizes = [
    { rank: "1", prize: "1,000 USDT + 100 DINO" },
    { rank: "2", prize: "900 USDT + 90 DINO" },
    { rank: "3", prize: "800 USDT + 80 DINO" },
    { rank: "4", prize: "700 USDT + 70 DINO" },
    { rank: "5", prize: "600 USDT + 60 DINO" },
    { rank: "6-10", prize: "400 USDT + 40 DINO each" },
    { rank: "11-50", prize: "100 USDT + 10 DINO each" },
    { rank: "51-100", prize: "10 USDT + 1 DINO each" },
  ]

  const grandPrizes = [
    { rank: "1", prize: "100,000 USDT + 10,000 DINO" },
    { rank: "2", prize: "90,000 USDT + 9,000 DINO" },
    { rank: "3", prize: "80,000 USDT + 8,000 DINO" },
    { rank: "4", prize: "70,000 USDT + 7,000 DINO" },
    { rank: "5", prize: "60,000 USDT + 6,000 DINO" },
    { rank: "6-10", prize: "30,000 USDT + 3,000 DINO each" },
    { rank: "11-50", prize: "1,000 USDT + 100 DINO each" },
    { rank: "51-100", prize: "100 USDT + 10 DINO each" },
    { rank: "101-10,000", prize: "1 USDT + 1 DINO each" },
    { rank: "Random User", prize: "100 USDT + 10 DINO" },
  ]

  const prizes = type === "mini" ? miniPrizes : grandPrizes
  const totalPrize = type === "mini" ? "10,500 USDT + 1,050 DINO" : "605,000 USDT + 60,500 DINO"

  return (
    <Card className={`bg-background/50 border-${type === "mini" ? "purple" : "indigo"}-700/30`}>
      <CardHeader
        className={`bg-${type === "mini" ? "purple" : "indigo"}-900/20 border-b border-${type === "mini" ? "purple" : "indigo"}-700/30`}
      >
        <div className="flex items-center">
          <Trophy className={`h-5 w-5 text-${type === "mini" ? "purple" : "indigo"}-400 mr-2`} />
          <CardTitle>{type === "mini" ? "Mini" : "Grand"} Tournament Prizes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-400">Total Prize Pool</p>
          <p className="text-2xl font-bold">{totalPrize}</p>
        </div>

        <div className="space-y-3">
          {prizes.map((prize) => (
            <div
              key={prize.rank}
              className="flex items-center p-3 rounded-lg bg-background/50 border border-gray-700/20"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 mr-4">
                <Gift className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1">
                <p className="font-medium">Rank {prize.rank}</p>
                <p className="text-sm text-gray-400">{prize.prize}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
