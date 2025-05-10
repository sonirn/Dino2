"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Video, Users, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PromotionBanner() {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="bg-gradient-to-r from-green-900/70 to-blue-900/70 border-green-500/30 overflow-hidden mb-16">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-400 rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm font-medium mb-3">
                  Limited Time Offer
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Get <span className="text-green-400">$200</span> Instantly by Creating a Video!
                </h2>
                <p className="text-gray-300 mb-4 max-w-xl">
                  Create and share a video about the DINO Tournament on your social media and earn $200 in rewards!
                </p>
              </div>

              <div className="flex-shrink-0">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-6 text-lg h-auto"
                >
                  <Link href="/claim-reward">Claim Your $200</Link>
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-gray-300 hover:text-white hover:bg-white/10 mx-auto flex items-center"
            >
              {expanded ? "Hide Details" : "View Requirements"}
              {expanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
            </Button>

            <div className={cn("grid grid-rows-[0fr] transition-all duration-300", expanded && "grid-rows-[1fr] mt-4")}>
              <div className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Video className="h-5 w-5 mr-2 text-green-400" />
                      Video Requirements
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Video content only (no images or text posts)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Must include your referral link and code in video and description</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>YouTube: Minimum 2,000 views required</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Other platforms: Minimum 10,000 views required</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-400" />
                      Referral Requirements
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>At least 25 valid users must register using your referral code</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Valid users = users who register and pay for any tournament</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>
                          Submit proof of referrals through the claim form with screenshots of registered users
                        </span>
                      </li>
                      <li className="flex items-start">
                        <DollarSign className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-green-300">
                          Rewards will be credited within 24 hours after review
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
