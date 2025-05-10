"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ScoreHistory from "@/components/score-history"
import ReferralStats from "@/components/referral-stats"
import WithdrawalSection from "@/components/withdrawal-section"
import BoosterHistory from "@/components/booster-history"
import TournamentHistory from "@/components/tournament-history"

interface ProfileTabsProps {
  profile: any
}

export default function ProfileTabs({ profile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("scores")

  return (
    <Tabs defaultValue="scores" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5 mb-8">
        <TabsTrigger value="scores">Scores</TabsTrigger>
        <TabsTrigger value="referrals">Referrals</TabsTrigger>
        <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        <TabsTrigger value="boosters">Boosters</TabsTrigger>
        <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
      </TabsList>

      <TabsContent value="scores">
        <Card className="bg-background/50 border-primary/20">
          <CardHeader>
            <CardTitle>Your Score History</CardTitle>
            <CardDescription>Track your performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreHistory scores={profile.scores || []} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="referrals">
        <Card className="bg-background/50 border-primary/20">
          <CardHeader>
            <CardTitle>Referral Statistics</CardTitle>
            <CardDescription>Track your referrals and earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralStats referrals={profile.referrals || []} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="withdrawals">
        <Card className="bg-background/50 border-primary/20">
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>Manage your withdrawals and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <WithdrawalSection
              balance={profile.balance || {}}
              withdrawals={profile.withdrawals || []}
              userId={profile.uid}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="boosters">
        <Card className="bg-background/50 border-primary/20">
          <CardHeader>
            <CardTitle>Booster History</CardTitle>
            <CardDescription>Track your purchased boosters and their usage</CardDescription>
          </CardHeader>
          <CardContent>
            <BoosterHistory boosters={profile.boosters || []} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tournaments">
        <Card className="bg-background/50 border-primary/20">
          <CardHeader>
            <CardTitle>Tournament History</CardTitle>
            <CardDescription>View your tournament participation and results</CardDescription>
          </CardHeader>
          <CardContent>
            <TournamentHistory tournaments={profile.tournamentHistory || []} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
