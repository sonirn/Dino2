"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { purchaseBooster } from "@/lib/firebase-utils"
import { validatePayment } from "@/lib/payment-utils"
import { Loader2, Zap, AlertCircle, CheckCircle, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BoosterPurchaseProps {
  userId: string
  onPurchaseComplete?: () => void
}

const BOOSTERS = [
  {
    id: 1,
    name: "Booster 1",
    price: 10,
    description: "Double your score for the next 10 games",
    games: 10,
    color: "from-green-600 to-green-800",
    textColor: "text-green-400",
  },
  {
    id: 2,
    name: "Booster 2",
    price: 50,
    description: "Double your score for the next 100 games",
    games: 100,
    color: "from-blue-600 to-blue-800",
    textColor: "text-blue-400",
  },
  {
    id: 3,
    name: "Booster 3",
    price: 100,
    description: "Double your score for all games until the tournament ends",
    games: null, // Unlimited
    color: "from-purple-600 to-purple-800",
    textColor: "text-purple-400",
  },
]

export default function BoosterPurchase({ userId, onPurchaseComplete }: BoosterPurchaseProps) {
  const { toast } = useToast()
  const [processing, setProcessing] = useState<number | null>(null)
  const [selectedBooster, setSelectedBooster] = useState<any>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [walletAddress, setWalletAddress] = useState("0x67A845bC54Eb830b1d724fa183F429E02c1237D1")
  const [transactionHash, setTransactionHash] = useState("")
  const [paymentStep, setPaymentStep] = useState<"details" | "confirmation" | "processing" | "complete">("details")

  const handleSelectBooster = (booster: any) => {
    setSelectedBooster(booster)
    setShowPaymentDialog(true)
    setPaymentStep("details")
    setTransactionHash("")
  }

  const handleCloseDialog = () => {
    setShowPaymentDialog(false)
    setSelectedBooster(null)
    setPaymentStep("details")
    setTransactionHash("")
  }

  const handleConfirmPayment = () => {
    if (!transactionHash) {
      toast({
        title: "Transaction Hash Required",
        description: "Please enter the transaction hash to verify your payment",
        variant: "destructive",
      })
      return
    }

    setPaymentStep("confirmation")
  }

  const handleProcessPayment = async () => {
    if (!selectedBooster || !userId) return

    try {
      setPaymentStep("processing")

      // Validate payment
      const paymentResult = await validatePayment({
        userId,
        amount: selectedBooster.price,
        boosterId: selectedBooster.id,
        walletAddress,
        transactionHash,
      })

      if (paymentResult.success) {
        // Register booster
        await purchaseBooster(userId, selectedBooster.id, selectedBooster.games)

        setPaymentStep("complete")

        toast({
          title: "Booster Purchased!",
          description: `Your ${selectedBooster.name} has been activated. Your scores will now be doubled.`,
        })

        if (onPurchaseComplete) {
          onPurchaseComplete()
        }
      } else {
        setPaymentStep("details")
        toast({
          title: "Payment Failed",
          description: paymentResult.message || "There was an issue with your payment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error purchasing booster:", error)
      setPaymentStep("details")
      toast({
        title: "Purchase Failed",
        description: "There was an error purchasing the booster. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
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
              {BOOSTERS.map((booster) => (
                <Card key={booster.id} className={`bg-gradient-to-br ${booster.color} border-primary/10 text-white`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      {booster.name}
                    </CardTitle>
                    <CardDescription className="text-white/80">{booster.price} USDT</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{booster.description}</p>
                    <Button
                      className="w-full bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => handleSelectBooster(booster)}
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

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentStep === "complete" ? "Purchase Complete" : `Purchase ${selectedBooster?.name}`}
            </DialogTitle>
            <DialogDescription>
              {paymentStep === "details" && "Complete your payment to activate your booster."}
              {paymentStep === "confirmation" && "Confirm your payment details."}
              {paymentStep === "processing" && "Processing your payment..."}
              {paymentStep === "complete" && "Your booster has been activated!"}
            </DialogDescription>
          </DialogHeader>

          {paymentStep === "details" && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex items-center p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <p className="text-xs text-yellow-300">
                    Send exactly {selectedBooster?.price} USDT (BEP20) to the wallet address below.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="wallet-address">Payment Address</Label>
                  <div className="flex items-center">
                    <Input id="wallet-address" value={walletAddress} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress)
                        toast({
                          title: "Copied!",
                          description: "Wallet address copied to clipboard",
                        })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tx-hash">Transaction Hash</Label>
                  <Input
                    id="tx-hash"
                    placeholder="Enter your transaction hash"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                  />
                  <p className="text-xs text-gray-400">
                    After sending the payment, paste the transaction hash here for verification.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmPayment}>Verify Payment</Button>
              </DialogFooter>
            </>
          )}

          {paymentStep === "confirmation" && (
            <>
              <div className="grid gap-4 py-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-1">Booster</p>
                  <p className="text-lg">{selectedBooster?.name}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-1">Price</p>
                  <p className="text-lg">{selectedBooster?.price} USDT</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-1">Transaction Hash</p>
                  <p className="text-xs break-all">{transactionHash}</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentStep("details")}>
                  Back
                </Button>
                <Button onClick={handleProcessPayment}>Process Payment</Button>
              </DialogFooter>
            </>
          )}

          {paymentStep === "processing" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Verifying your payment...</p>
              <p className="text-sm text-gray-400 mt-2">This may take a few moments.</p>
            </div>
          )}

          {paymentStep === "complete" && (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-green-900/20 rounded-full p-3 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Booster Activated!</h3>
                <p className="text-center text-gray-400 mb-4">
                  Your {selectedBooster?.name} has been successfully activated. Your scores will now be doubled
                  {selectedBooster?.games
                    ? ` for the next ${selectedBooster.games} games.`
                    : " until the tournament ends."}
                </p>
              </div>

              <DialogFooter>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
