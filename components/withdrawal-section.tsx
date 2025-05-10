"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { processWithdrawal } from "@/lib/firebase-utils"
import { AlertCircle, Loader2, ArrowDownToLine, CheckCircle, XCircle } from "lucide-react"

interface WithdrawalSectionProps {
  balance: {
    available: number
    dino: number
    referral: number
  }
  withdrawals: any[]
  userId: string
}

export default function WithdrawalSection({ balance, withdrawals, userId }: WithdrawalSectionProps) {
  const { toast } = useToast()
  const [walletAddress, setWalletAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [withdrawalType, setWithdrawalType] = useState<"usdt" | "dino">("usdt")
  const [processing, setProcessing] = useState(false)

  const handleWithdrawal = async () => {
    if (!walletAddress || !amount) {
      toast({
        title: "Missing Information",
        description: "Please provide both wallet address and amount",
        variant: "destructive",
      })
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      })
      return
    }

    const maxAmount = withdrawalType === "usdt" ? balance.available : balance.dino
    if (numAmount > maxAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${withdrawalType.toUpperCase()} for this withdrawal`,
        variant: "destructive",
      })
      return
    }

    if (withdrawalType === "usdt" && numAmount < 10) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is 10 USDT",
        variant: "destructive",
      })
      return
    }

    if (withdrawalType === "dino" && numAmount < 100) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is 100 DINO",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)
      await processWithdrawal(userId, {
        amount: numAmount,
        currency: withdrawalType.toUpperCase(),
        walletAddress,
      })

      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal of ${numAmount} ${withdrawalType.toUpperCase()} has been submitted for processing`,
      })

      // Reset form
      setWalletAddress("")
      setAmount("")
    } catch (error) {
      console.error("Error processing withdrawal:", error)
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Sort withdrawals by date (newest first)
  const sortedWithdrawals = [...(withdrawals || [])].sort((a, b) => {
    return b.timestamp?.seconds - a.timestamp?.seconds
  })

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-background/80 border-primary/10">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Request Withdrawal</h3>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  variant={withdrawalType === "usdt" ? "default" : "outline"}
                  onClick={() => setWithdrawalType("usdt")}
                  className="flex-1"
                >
                  USDT
                </Button>
                <Button
                  variant={withdrawalType === "dino" ? "default" : "outline"}
                  onClick={() => setWithdrawalType("dino")}
                  className="flex-1"
                >
                  DINO
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet-address">BEP20 Wallet Address</Label>
                <Input
                  id="wallet-address"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount">Amount</Label>
                  <span className="text-sm text-gray-400">
                    Available: {withdrawalType === "usdt" ? balance.available : balance.dino}{" "}
                    {withdrawalType.toUpperCase()}
                  </span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder={withdrawalType === "usdt" ? "Min. 10 USDT" : "Min. 100 DINO"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="flex items-center p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-xs text-yellow-300">
                  Withdrawals are processed within 24-48 hours. Minimum withdrawal is
                  {withdrawalType === "usdt" ? " 10 USDT" : " 100 DINO"}.
                </p>
              </div>

              <Button className="w-full" onClick={handleWithdrawal} disabled={processing || !walletAddress || !amount}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Withdraw {withdrawalType.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 border-primary/10">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Balance Information</h3>

            <div className="space-y-4">
              <div className="p-4 border border-primary/10 rounded-lg">
                <p className="text-sm text-gray-400">Available USDT</p>
                <p className="text-2xl font-bold">{balance.available || 0} USDT</p>
                <p className="text-xs text-gray-500 mt-1">Available for immediate withdrawal</p>
              </div>

              <div className="p-4 border border-primary/10 rounded-lg">
                <p className="text-sm text-gray-400">DINO Tokens</p>
                <p className="text-2xl font-bold">{balance.dino || 0} DINO</p>
                <p className="text-xs text-gray-500 mt-1">Can be withdrawn or held for future value</p>
              </div>

              <div className="p-4 border border-primary/10 rounded-lg">
                <p className="text-sm text-gray-400">Referral Balance</p>
                <p className="text-xl font-semibold">{balance.referral || 0} USDT</p>
                <p className="text-xs text-gray-500 mt-1">
                  Transferred to main balance after tournament ends (min. 10 USDT)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>

        {sortedWithdrawals.length === 0 ? (
          <p className="text-center py-8 text-gray-400">No withdrawal history yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedWithdrawals.map((withdrawal, index) => {
              // Convert Firebase timestamp to Date
              const date = withdrawal.timestamp?.toDate
                ? withdrawal.timestamp.toDate()
                : new Date(withdrawal.timestamp?.seconds * 1000)

              return (
                <Card key={index} className="bg-background/50 border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <ArrowDownToLine className="h-4 w-4 mr-2 text-primary" />
                          <p className="font-medium">
                            {withdrawal.amount} {withdrawal.currency}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          To: {withdrawal.walletAddress.substring(0, 6)}...
                          {withdrawal.walletAddress.substring(withdrawal.walletAddress.length - 4)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            withdrawal.status === "completed"
                              ? "bg-green-900/30 text-green-400"
                              : withdrawal.status === "pending"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {withdrawal.status === "completed" ? (
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </span>
                          ) : withdrawal.status === "pending" ? (
                            <span className="flex items-center">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Pending
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </span>
                          )}
                        </span>

                        {withdrawal.txHash && (
                          <a
                            href={`https://bscscan.com/tx/${withdrawal.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            View Transaction
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
