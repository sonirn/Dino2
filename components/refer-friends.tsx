"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Copy, Share2, Users, CheckCircle, LinkIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ReferFriendsProps {
  referralCode: string
  referralStats: {
    total: number
    valid: number
    pending: number
    earnings: number
  }
}

export default function ReferFriends({ referralCode, referralStats }: ReferFriendsProps) {
  const { toast } = useToast()
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}?ref=${referralCode}`
      : `https://dino-tournament.com?ref=${referralCode}`

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopiedReferral(true)
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    })

    setTimeout(() => {
      setCopiedReferral(false)
    }, 3000)
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })

    setTimeout(() => {
      setCopiedLink(false)
    }, 3000)
  }

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join DINO Tournament",
          text: `Join the DINO Tournament and win from a prize pool of over 615,500 USDT! Use my referral code: ${referralCode}`,
          url: referralLink,
        })
        toast({
          title: "Shared!",
          description: "Thanks for sharing DINO Tournament",
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      copyReferralLink()
    }
  }

  return (
    <Card className="bg-background/50 border-primary/20">
      <CardHeader>
        <CardTitle>Refer Friends & Earn</CardTitle>
        <CardDescription>Earn 1 USDT for each valid referral</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="share">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="share">Share & Earn</TabsTrigger>
            <TabsTrigger value="stats">Referral Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="share">
            <div className="space-y-6">
              <Alert className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700/30">
                <AlertTitle className="font-semibold text-lg mb-2">How it works</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Share your unique referral code or link with friends</li>
                    <li>Friends register using your referral code</li>
                    <li>When they join any tournament, you earn 1 USDT per valid referral</li>
                    <li>Referral earnings are transferred to your main balance after tournament ends</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Referral Code</label>
                  <div className="flex">
                    <Input value={referralCode} readOnly className="rounded-r-none bg-background/50" />
                    <Button variant="outline" className="rounded-l-none border-l-0" onClick={copyReferralCode}>
                      {copiedReferral ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Referral Link</label>
                  <div className="flex">
                    <Input
                      value={referralLink}
                      readOnly
                      className="rounded-r-none bg-background/50 text-xs sm:text-sm"
                    />
                    <Button variant="outline" className="rounded-l-none border-l-0" onClick={copyReferralLink}>
                      {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full" onClick={shareReferral}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share with Friends
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="bg-background/80 border-primary/10">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-blue-400 mr-2" />
                      <p className="text-xs text-gray-400">Total Referrals</p>
                    </div>
                    <p className="text-2xl font-bold">{referralStats.total}</p>
                  </CardContent>
                </Card>

                <Card className="bg-background/80 border-primary/10">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      <p className="text-xs text-gray-400">Valid Referrals</p>
                    </div>
                    <p className="text-2xl font-bold">{referralStats.valid}</p>
                  </CardContent>
                </Card>

                <Card className="bg-background/80 border-primary/10">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <LinkIcon className="h-5 w-5 text-yellow-400 mr-2" />
                      <p className="text-xs text-gray-400">Pending</p>
                    </div>
                    <p className="text-2xl font-bold">{referralStats.pending}</p>
                  </CardContent>
                </Card>

                <Card className="bg-background/80 border-primary/10">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <p className="text-xs text-gray-400">Total Earnings</p>
                    </div>
                    <p className="text-2xl font-bold">{referralStats.earnings} USDT</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-400 mb-2">Important Notes</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-300">
                  <li>A valid referral is someone who registers using your code and pays for any tournament</li>
                  <li>Referral balance transfers to main balance after tournament ends</li>
                  <li>Minimum 10 USDT required for referral balance transfer</li>
                  <li>For detailed referral history, check the Referrals tab in your profile</li>
                </ul>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={shareReferral}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Invite More Friends
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
