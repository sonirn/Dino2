"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ClaimRewardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    username: "",
    videoLink: "",
    email: user?.email || "",
    walletAddress: "",
    notes: "",
  })

  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0])

      // Clear error when file is selected
      if (errors.screenshot) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.screenshot
          return newErrors
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!formData.videoLink.trim()) {
      newErrors.videoLink = "Video link is required"
    } else if (!isValidURL(formData.videoLink)) {
      newErrors.videoLink = "Please enter a valid URL"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = "BEP20 wallet address is required"
    } else if (!isValidBEP20Address(formData.walletAddress)) {
      newErrors.walletAddress = "Please enter a valid BEP20 wallet address"
    }

    if (!screenshot) {
      newErrors.screenshot = "Screenshot proof is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidURL = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidBEP20Address = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Form Validation Error",
        description: "Please check the form for errors and try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real application, you would submit the form data to your backend here
      // For this example, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Claim Submitted Successfully!",
        description: "Your reward claim has been received and will be reviewed within 24 hours.",
      })

      // Redirect to home page after successful submission
      router.push("/")
    } catch (error) {
      console.error("Error submitting claim:", error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your claim. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="bg-background/50 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border-b border-primary/20">
            <CardTitle className="text-2xl">Claim Your $200 Reward</CardTitle>
            <CardDescription>Submit your video promotion details to receive your reward</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-400 mb-1">Requirements</h3>
                    <ul className="text-sm text-yellow-300 space-y-1 list-disc pl-5">
                      <li>Video content only (no images or text posts)</li>
                      <li>Must include your referral link and code in video and description</li>
                      <li>YouTube: Minimum 2,000 views required</li>
                      <li>Other platforms: Minimum 10,000 views required</li>
                      <li>At least 25 valid users must register using your referral code</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">DINO Tournament Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Your username in the tournament"
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="videoLink">Video Link</Label>
                  <Input
                    id="videoLink"
                    name="videoLink"
                    value={formData.videoLink}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className={errors.videoLink ? "border-red-500" : ""}
                  />
                  {errors.videoLink && <p className="text-sm text-red-500">{errors.videoLink}</p>}
                  <p className="text-xs text-gray-400">Link to your video on YouTube, TikTok, Instagram, etc.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="screenshot">Screenshot Proof (25+ Valid Referrals)</Label>
                  <div className="flex items-center">
                    <Label
                      htmlFor="screenshot-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-background/70 ${
                        errors.screenshot ? "border-red-500" : "border-gray-600"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG or PDF (max. 10MB)</p>
                      </div>
                      <Input
                        id="screenshot-upload"
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </Label>
                  </div>
                  {screenshot && <p className="text-sm text-green-500">File selected: {screenshot.name}</p>}
                  {errors.screenshot && <p className="text-sm text-red-500">{errors.screenshot}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="walletAddress">BEP20 Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleChange}
                    placeholder="0x..."
                    className={errors.walletAddress ? "border-red-500" : ""}
                  />
                  {errors.walletAddress && <p className="text-sm text-red-500">{errors.walletAddress}</p>}
                  <p className="text-xs text-gray-400">Your BEP20 wallet address to receive the reward</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional information you'd like to share..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-amber-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Rewards will be credited within 24 hours after reviewing this form.
              </p>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Claim"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
