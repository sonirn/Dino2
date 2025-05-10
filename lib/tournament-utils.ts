import { checkTournamentEligibility as checkEligibility } from "@/lib/firebase-utils"

// Function to check if a user is eligible to play in tournaments
export async function checkTournamentEligibility(userId: string) {
  try {
    return await checkEligibility(userId)
  } catch (error) {
    console.error("Error checking tournament eligibility:", error)
    throw error
  }
}

// Calculate prize distribution based on rank
export function calculatePrize(tournamentType: "mini" | "grand", rank: number) {
  if (tournamentType === "mini") {
    if (rank === 1) return { usdt: 1000, dino: 100 }
    if (rank === 2) return { usdt: 900, dino: 90 }
    if (rank === 3) return { usdt: 800, dino: 80 }
    if (rank === 4) return { usdt: 700, dino: 70 }
    if (rank === 5) return { usdt: 600, dino: 60 }
    if (rank >= 6 && rank <= 10) return { usdt: 400, dino: 40 }
    if (rank >= 11 && rank <= 50) return { usdt: 100, dino: 10 }
    if (rank >= 51 && rank <= 100) return { usdt: 10, dino: 1 }
    return { usdt: 0, dino: 0 }
  } else {
    if (rank === 1) return { usdt: 100000, dino: 10000 }
    if (rank === 2) return { usdt: 90000, dino: 9000 }
    if (rank === 3) return { usdt: 80000, dino: 8000 }
    if (rank === 4) return { usdt: 70000, dino: 7000 }
    if (rank === 5) return { usdt: 60000, dino: 6000 }
    if (rank >= 6 && rank <= 10) return { usdt: 30000, dino: 3000 }
    if (rank >= 11 && rank <= 50) return { usdt: 1000, dino: 100 }
    if (rank >= 51 && rank <= 100) return { usdt: 100, dino: 10 }
    if (rank >= 101 && rank <= 10000) return { usdt: 1, dino: 1 }
    return { usdt: 0, dino: 0 }
  }
}
