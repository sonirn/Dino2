import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, UserX } from "lucide-react"

interface Referral {
  id: string
  referredUser: string
  timestamp: any // Firebase timestamp
  status: "pending" | "valid"
  reward: number
}

interface ReferralStatsProps {
  referrals: Referral[]
}

export default function ReferralStats({ referrals }: ReferralStatsProps) {
  // Count valid referrals
  const validReferrals = referrals.filter((ref) => ref.status === "valid").length
  const pendingReferrals = referrals.filter((ref) => ref.status === "pending").length

  // Calculate total earnings
  const totalEarnings = referrals.reduce((total, ref) => {
    return ref.status === "valid" ? total + ref.reward : total
  }, 0)

  if (referrals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No referrals yet. Share your referral code to start earning!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-400 mr-2" />
              <p className="text-sm text-gray-400">Total Referrals</p>
            </div>
            <p className="text-3xl font-bold">{referrals.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserCheck className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-gray-400">Valid Referrals</p>
            </div>
            <p className="text-3xl font-bold">{validReferrals}</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserX className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-gray-400">Pending Referrals</p>
            </div>
            <p className="text-3xl font-bold">{pendingReferrals}</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-primary/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-primary mr-2" />
              <p className="text-sm text-gray-400">Total Earnings</p>
            </div>
            <p className="text-3xl font-bold">{totalEarnings} USDT</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-3">Referral History</h3>

      <div className="space-y-3">
        {referrals.map((referral) => {
          // Convert Firebase timestamp to Date
          const date = referral.timestamp?.toDate
            ? referral.timestamp.toDate()
            : new Date(referral.timestamp?.seconds * 1000)

          return (
            <Card key={referral.id} className="bg-background/50 border-primary/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{referral.referredUser}</p>
                      <p className="text-xs text-gray-400">{date.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        referral.status === "valid"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {referral.status === "valid" ? "Valid" : "Pending"}
                    </span>

                    {referral.status === "valid" && <p className="text-sm font-medium mt-1">+{referral.reward} USDT</p>}
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
