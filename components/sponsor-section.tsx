import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function SponsorSection() {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-10">Our Sponsors</h2>
      <Card className="bg-background/50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <Link
              href="https://www.kucoin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center transition-transform hover:scale-105"
            >
              <div className="bg-white rounded-xl p-6 mb-2">
                <Image src="/images/kucoin.png" alt="KuCoin" width={200} height={80} className="h-12 object-contain" />
              </div>
              <p className="text-sm text-gray-400">KuCoin</p>
            </Link>

            <Link
              href="https://pancakeswap.finance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center transition-transform hover:scale-105"
            >
              <div className="bg-white rounded-xl p-6 mb-2">
                <Image
                  src="/images/pancakeswap.png"
                  alt="PancakeSwap"
                  width={200}
                  height={80}
                  className="h-12 object-contain"
                />
              </div>
              <p className="text-sm text-gray-400">PancakeSwap</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
