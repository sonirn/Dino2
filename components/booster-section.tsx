"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { purchaseBooster } from "@/lib/firebase-utils"
import { validatePayment } from "@/lib/payment-utils"
import { Loader2, Zap, AlertCircle } from "lucide-react"

interface BoosterSectionProps {
  userId: string
}

export default function BoosterSection({ userId }: BoosterSectionProps) {
  const { toast } = useToast()
  const [processing, setProcessing] = useState<number | null>(null)

  const boosters = [
    {
      id: 1,
      name: "Booster 1",
      price: 10,
      description: "Double your score for the next 10 games",
      games: 10,
    },
    {
      id: 2,
      name: "Booster 2",
      price: 50,
      description: "Double your score for the next 100 games",
      games: 100,
    },
    {
      id: 3,
      name: "Booster 3",
      price: 100,
      description: "Double your score for all games until the tournament ends",
      games: null, // Unlimited
    },
  ]

  const handlePurchase = async (boosterId: number, price: number, games: number | null) => {
    if (!userId) return

    try {
      setProcessing(boosterId)

      // Validate payment
      const paymentResult = await validatePayment({
        userId,
        amount: price,
        boosterId,
        walletAddress: "0x67A845bC54Eb830b1d724fa183F429E02c1237D1",
      })

      if (paymentResult.success) {
        // Register booster
        await purchaseBooster(userId, boosterId, games)

        toast({
          title: "Booster Purchased!",
          description: `Your booster has been activated. Your scores will now be doubled.`,
        })
      } else {
        toast({
          title: "Payment Failed",
          description: paymentResult.message || "There was an issue with your payment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error purchasing booster:", error)
      toast({
        title: "Purchase Failed",
        description: "There was an error purchasing the booster. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  return (
    <Card className="bg-background/50 border-primary/20 mb-8">
      <CardHeader>
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-primary mr-2" />
          <CardTitle>Power Boosters</CardTitle>
        </div>
        <CardDescription>Boost your scores to climb the leaderboard faster!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
            <p className="text-xs text-yellow-300">
              Boosters are only available for the Grand Tournament. Payments are processed on the BEP20 network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boosters.map((booster) => (
              <Card key={booster.id} className="bg-background/80 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{booster.name}</CardTitle>
                  <CardDescription>{booster.price} USDT</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{booster.description}</p>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(booster.id, booster.price, booster.games)}
                    disabled={processing === booster.id}
                  >
                    {processing === booster.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
