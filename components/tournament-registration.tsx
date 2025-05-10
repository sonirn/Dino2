"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { registerForTournament } from "@/lib/firebase-utils"
import { validatePayment, PAYMENT_WALLET_ADDRESS } from "@/lib/payment-utils"
import { Loader2, Trophy, AlertCircle, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TournamentRegistration() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [processingMini, setProcessingMini] = useState(false)
  const [processingGrand, setProcessingGrand] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [activeTab, setActiveTab] = useState<"registration" | "rules" | "prizes">("registration")

  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<"mini" | "grand" | null>(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [transactionHash, setTransactionHash] = useState("")
  const [paymentStep, setPaymentStep] = useState<"details" | "confirmation" | "processing" | "complete">("details")

  // Tournament dates
  const [tournamentDates, setTournamentDates] = useState({
    start: new Date(),
    end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
  })

  useEffect(() => {
    // Calculate tournament period based on current date
    const calculateTournamentPeriod = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const currentDay = now.getDate()

      let startDate, endDate

      // First half of the month (1-15)
      if (currentDay <= 15) {
        startDate = new Date(currentYear, currentMonth, 1)
        endDate = new Date(currentYear, currentMonth, 15, 23, 59, 59)
      }
      // Second half of the month (16-end)
      else {
        startDate = new Date(currentYear, currentMonth, 16)
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59) // Last day of current month
      }

      return { start: startDate, end: endDate }
    }

    const period = calculateTournamentPeriod()
    setTournamentDates(period)
  }, [])

  const handleRegister = async (tournamentType: "mini" | "grand") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for the tournament",
        variant: "destructive",
      })
      return
    }

    try {
      if (tournamentType === "mini") {
        setProcessingMini(true)
      } else {
        setProcessingGrand(true)
      }

      // Show payment dialog instead of immediately processing
      setShowPaymentDialog(true)
      setSelectedTournament(tournamentType)
      setPaymentAmount(tournamentType === "mini" ? 1 : 10)
      setPaymentStep("details")
      setTransactionHash("")
    } catch (error) {
      console.error("Error registering for tournament:", error)
      toast({
        title: "Registration Failed",
        description: "There was an error registering for the tournament. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (tournamentType === "mini") {
        setProcessingMini(false)
      } else {
        setProcessingGrand(false)
      }
    }
  }

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(PAYMENT_WALLET_ADDRESS)
    setCopiedAddress(true)
    toast({
      title: "Address Copied",
      description: "Payment address copied to clipboard",
    })
    setTimeout(() => setCopiedAddress(false), 3000)
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="registration" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="rules">Tournament Rules</TabsTrigger>
            <TabsTrigger value="prizes">Prize Pool</TabsTrigger>
          </TabsList>

          <TabsContent value="registration">
            <Card className="bg-background/50 border-primary/20 mb-8">
              <CardHeader>
                <CardTitle>Tournament Registration</CardTitle>
                <CardDescription>Register for the Dino Tournament to compete for prizes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Payment Instructions
                  </h3>
                  <p className="text-gray-300 mb-4">
                    To register for a tournament, send the required USDT (BEP20) to the following address:
                  </p>
                  <div className="flex items-center bg-background/50 p-3 rounded-lg mb-4">
                    <code className="text-sm flex-1 overflow-x-auto">{PAYMENT_WALLET_ADDRESS}</code>
                    <Button variant="outline" size="sm" onClick={copyWalletAddress} className="ml-2 flex-shrink-0">
                      {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-yellow-300">
                    After sending payment, click the registration button below to verify your transaction.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Tournament Period</h3>
                  <p className="text-gray-300">
                    Current Tournament: {formatDate(tournamentDates.start)} - {formatDate(tournamentDates.end)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Registration is valid for the entire tournament period. Join now to maximize your chances!
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <Card className="flex-1 bg-purple-900/20 border-purple-700/30">
                    <CardHeader>
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-purple-400 mr-2" />
                        <CardTitle>Mini Tournament</CardTitle>
                      </div>
                      <CardDescription>Entry Fee: 1 USDT (BEP20)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm">
                          Join the Mini Tournament and compete for a share of 10,500 USDT + 1,050 DINO!
                        </p>
                        <div className="flex items-center p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                          <p className="text-xs text-yellow-300">
                            Payment will be processed on the BEP20 network. Make sure you have USDT in your wallet.
                          </p>
                        </div>
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleRegister("mini")}
                          disabled={processingMini}
                        >
                          {processingMini ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Register for 1 USDT"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex-1 bg-indigo-900/20 border-indigo-700/30">
                    <CardHeader>
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-indigo-400 mr-2" />
                        <CardTitle>Grand Tournament</CardTitle>
                      </div>
                      <CardDescription>Entry Fee: 10 USDT (BEP20)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm">
                          Join the Grand Tournament and compete for a share of 605,000 USDT + 60,500 DINO!
                        </p>
                        <div className="flex items-center p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                          <p className="text-xs text-yellow-300">
                            Payment will be processed on the BEP20 network. Make sure you have USDT in your wallet.
                          </p>
                        </div>
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handleRegister("grand")}
                          disabled={processingGrand}
                        >
                          {processingGrand ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Register for 10 USDT"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card className="bg-background/50 border-primary/20 mb-8">
              <CardHeader>
                <CardTitle>Tournament Rules</CardTitle>
                <CardDescription>Everything you need to know about the Dino Tournament</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Game Rules</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Play the Chrome Dinosaur game by jumping over cacti and avoiding birds</li>
                    <li>Press Space or Up Arrow to jump, Down Arrow to duck</li>
                    <li>Your highest score will be recorded on the leaderboard</li>
                    <li>You can play as many times as you want during the tournament period</li>
                    <li>The tournament ends on {formatDate(tournamentDates.end)}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Entry Requirements</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Mini Tournament: 1 USDT (BEP20) one-time fee</li>
                    <li>Grand Tournament: 10 USDT (BEP20) one-time fee</li>
                    <li>You can only play after paying the tournament fee</li>
                    <li>You can participate in both tournaments simultaneously</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Ranking System</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Rankings are based on your highest score achieved</li>
                    <li>Your highest score determines your position on the leaderboard</li>
                    <li>Each tournament has its own separate leaderboard</li>
                    <li>Scores are updated in real-time</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Boosters (Grand Tournament Only)</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Booster 1: 10 USDT - Double score for next 10 games</li>
                    <li>Booster 2: 50 USDT - Double score for next 100 games</li>
                    <li>Booster 3: 100 USDT - Double score for all games until tournament end</li>
                    <li>Boosters can significantly increase your chances of winning</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Referral System</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Earn 1 USDT for each valid referral</li>
                    <li>A valid referral is someone who registers using your code and pays for any tournament</li>
                    <li>Referral balance transfers to main balance after tournament ends</li>
                    <li>Minimum 10 USDT required for referral balance transfer</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Prize Distribution</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Prizes are distributed within 72 hours after the tournament ends</li>
                    <li>Winners will be notified via email</li>
                    <li>Prizes are paid in USDT (BEP20) and DINO tokens</li>
                    <li>You must verify your wallet address before receiving prizes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prizes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-purple-900/20 border-purple-700/30">
                <CardHeader>
                  <div className="flex items-center">
                    <Trophy className="h-6 w-6 text-purple-400 mr-3" />
                    <CardTitle>Mini Tournament Prizes</CardTitle>
                  </div>
                  <CardDescription>Total Prize Pool: 10,500 USDT + 1,050 DINO</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-background/50 rounded-lg border border-purple-700/30">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20 mr-4">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">1st Place</p>
                        <p className="text-lg font-bold">1,000 USDT + 100 DINO</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-background/50 rounded-lg border border-purple-700/30">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-400/20 mr-4">
                        <Trophy className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">2nd Place</p>
                        <p className="text-lg font-bold">900 USDT + 90 DINO</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-background/50 rounded-lg border border-purple-700/30">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-700/20 mr-4">
                        <Trophy className="h-5 w-5 text-amber-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">3rd Place</p>
                        <p className="text-lg font-bold">800 USDT + 80 DINO</p>
                      </div>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg border border-purple-700/30">
                      <p className="font-medium mb-2">Additional Prizes:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>4th Place: 700 USDT + 70 DINO</li>
                        <li>5th Place: 600 USDT + 60 DINO</li>
                        <li>6th-10th Place: 400 USDT + 40 DINO each</li>
                        <li>11th-50th Place: 100 USDT + 10 DINO each</li>
                        <li>51st-100th Place: 10 USDT + 1 DINO each</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-indigo-900/20 border-indigo-700/30">
                <CardHeader>
                  <div className="flex items-center">
                    <Trophy className="h-6 w-6 text-indigo-400 mr-3" />
                    <CardTitle>Grand Tournament Prizes</CardTitle>
                  </div>
                  <CardDescription>Total Prize Pool: 605,000 USDT + 60,500 DINO</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-background/50 rounded-lg border border-indigo-700/30">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20 mr-4">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">1st Place</p>
                        <p className="text-lg font-bold">100,000 USDT + 10,000 DINO</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-background/50 rounded-lg border border-indigo-700/30">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-400/20 mr-4">
                        <Trophy className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">2nd Place</p>
                        <p className="text-lg font-bold">90,000 USDT + 9,000 DINO</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-background/50 rounded-lg border border-indigo-700/30">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-700/20 mr-4">
                        <Trophy className="h-5 w-5 text-amber-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">3rd Place</p>
                        <p className="text-lg font-bold">80,000 USDT + 8,000 DINO</p>
                      </div>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg border border-indigo-700/30">
                      <p className="font-medium mb-2">Additional Prizes:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>4th Place: 70,000 USDT + 7,000 DINO</li>
                        <li>5th Place: 60,000 USDT + 6,000 DINO</li>
                        <li>6th-10th Place: 30,000 USDT + 3,000 DINO each</li>
                        <li>11th-50th Place: 1,000 USDT + 100 DINO each</li>
                        <li>51st-100th Place: 100 USDT + 10 DINO each</li>
                        <li>101st-10,000th Place: 1 USDT + 1 DINO each</li>
                        <li>Random User: 100 USDT + 10 DINO</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentStep === "complete"
                ? "Registration Complete"
                : `Register for ${selectedTournament === "mini" ? "Mini" : "Grand"} Tournament`}
            </DialogTitle>
            <DialogDescription>
              {paymentStep === "details" && "Complete your payment to register for the tournament."}
              {paymentStep === "confirmation" && "Confirm your payment details."}
              {paymentStep === "processing" && "Processing your payment..."}
              {paymentStep === "complete" && "Your tournament registration is complete!"}
            </DialogDescription>
          </DialogHeader>

          {paymentStep === "details" && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex items-center p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <p className="text-xs text-yellow-300">
                    Send exactly {paymentAmount} USDT (BEP20) to the wallet address below.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="wallet-address">Payment Address</Label>
                  <div className="flex items-center">
                    <Input id="wallet-address" value={PAYMENT_WALLET_ADDRESS} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(PAYMENT_WALLET_ADDRESS)
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
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!transactionHash) {
                      toast({
                        title: "Transaction Hash Required",
                        description: "Please enter the transaction hash to verify your payment",
                        variant: "destructive",
                      })
                      return
                    }
                    setPaymentStep("confirmation")
                  }}
                >
                  Verify Payment
                </Button>
              </DialogFooter>
            </>
          )}

          {paymentStep === "confirmation" && (
            <>
              <div className="grid gap-4 py-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-1">Tournament</p>
                  <p className="text-lg">{selectedTournament === "mini" ? "Mini Tournament" : "Grand Tournament"}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-1">Price</p>
                  <p className="text-lg">{paymentAmount} USDT</p>
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
                <Button
                  onClick={async () => {
                    setPaymentStep("processing")

                    try {
                      // Validate payment
                      const paymentResult = await validatePayment({
                        userId: user.uid,
                        amount: paymentAmount,
                        tournamentType: selectedTournament!,
                        walletAddress: PAYMENT_WALLET_ADDRESS,
                        transactionHash,
                      })

                      if (paymentResult.success) {
                        // Register user for tournament
                        await registerForTournament(user.uid, selectedTournament!)

                        setPaymentStep("complete")

                        toast({
                          title: "Registration Successful",
                          description: `You have successfully registered for the ${
                            selectedTournament === "mini" ? "Mini" : "Grand"
                          } Tournament!`,
                        })

                        // Refresh the page to show the game
                        setTimeout(() => {
                          router.refresh()
                        }, 2000)
                      } else {
                        setPaymentStep("details")
                        toast({
                          title: "Payment Failed",
                          description:
                            paymentResult.message || "There was an issue with your payment. Please try again.",
                          variant: "destructive",
                        })
                      }
                    } catch (error) {
                      console.error("Error processing payment:", error)
                      setPaymentStep("details")
                      toast({
                        title: "Payment Failed",
                        description: "There was an error processing your payment. Please try again.",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Confirm Payment
                </Button>
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
                <h3 className="text-xl font-bold mb-2">Registration Complete!</h3>
                <p className="text-center text-gray-400 mb-4">
                  You have successfully registered for the {selectedTournament === "mini" ? "Mini" : "Grand"}{" "}
                  Tournament. You can now play and compete for prizes!
                </p>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowPaymentDialog(false)
                    router.refresh()
                  }}
                >
                  Start Playing
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
