import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function TournamentRules() {
  return (
    <Card className="bg-background/50 border-primary/20">
      <CardHeader className="flex flex-row items-center">
        <Info className="h-5 w-5 text-primary mr-2" />
        <CardTitle>Tournament Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h3 className="font-semibold mb-1">Entry Requirements</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mini Tournament: 1 USDT (BEP20) one-time fee</li>
            <li>Grand Tournament: 10 USDT (BEP20) one-time fee</li>
            <li>You can only play after paying the tournament fee</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Ranking System</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Rankings are based on your highest score achieved</li>
            <li>Your highest score determines your position on the leaderboard</li>
            <li>You can participate in both tournaments simultaneously</li>
            <li>Each tournament has its own separate leaderboard</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Boosters (Grand Tournament Only)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Booster 1: 10 USDT - Double score for next 10 games</li>
            <li>Booster 2: 50 USDT - Double score for next 100 games</li>
            <li>Booster 3: 100 USDT - Double score for all games until tournament end</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Referral System</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Earn 1 USDT for each valid referral</li>
            <li>A valid referral is someone who registers using your code and pays for any tournament</li>
            <li>Referral balance transfers to main balance after tournament ends</li>
            <li>Minimum 10 USDT required for referral balance transfer</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
