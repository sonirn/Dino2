import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  increment as incrementFieldValue,
  Timestamp,
} from "firebase/firestore"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { generateReferralCode as generateReferralCodeUtil } from "@/lib/utils"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZKtnnm3hc6ViJLSLhV7PK8calqELiL_4",
  authDomain: "magic-image-ai-15a0d.firebaseapp.com",
  databaseURL: "https://magic-image-ai-15a0d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "magic-image-ai-15a0d",
  storageBucket: "magic-image-ai-15a0d.firebasestorage.app",
  messagingSenderId: "864109068756",
  appId: "1:864109068756:web:2d680b0c0d5b791f32d641",
  measurementId: "G-M6EM5CCVQ2",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

// Authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error.code)
    throw new Error(errorMessage)
  }
}

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error.code)
    throw new Error(errorMessage)
  }
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error.code)
    throw new Error(errorMessage)
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    throw new Error("Failed to sign out. Please try again.")
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "The email address is not valid."
    case "auth/user-disabled":
      return "This user account has been disabled."
    case "auth/user-not-found":
      return "No user found with this email address."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/email-already-in-use":
      return "This email is already in use by another account."
    case "auth/weak-password":
      return "The password is too weak. Please use a stronger password."
    case "auth/popup-closed-by-user":
      return "Sign in was cancelled. Please try again."
    case "auth/operation-not-allowed":
      return "This operation is not allowed."
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again."
    default:
      return "An error occurred during authentication. Please try again."
  }
}

// Helper function to check if we're in a preview environment or offline
const isPreviewOrOffline = () => {
  // Check if we're using a mock user (preview environment)
  const hasMockUser = typeof localStorage !== "undefined" && localStorage.getItem("mockUser") !== null

  // Return true if we're in a preview environment
  return hasMockUser
}

// Create user profile in Firestore
export async function createUserProfile(user: User | null, referralCode?: string | null) {
  if (!user) return null

  try {
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      // Create new user profile
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        balance: 0, // Initial balance
        referredBy: referralCode || null,
        referralCode: generateReferralCodeUtil(user.uid),
        referralCount: 0,
        tournaments: [],
        boosters: [],
      }

      await setDoc(userRef, userData)

      // If user was referred, update referrer's stats
      if (referralCode) {
        await handleReferral(referralCode)
      }

      return userData
    } else {
      // User already exists, just return the data
      return userSnap.data()
    }
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

/**
 * Handles referral logic when a new user signs up with a referral code
 */
async function handleReferral(referralCode: string) {
  try {
    // Find the user with this referral code
    const usersRef = doc(db, "referralCodes", referralCode)
    const referralSnap = await getDoc(usersRef)

    if (referralSnap.exists()) {
      const referrerId = referralSnap.data().userId
      const referrerRef = doc(db, "users", referrerId)

      // Update referrer's stats
      await updateDoc(referrerRef, {
        referralCount: increment(1),
        balance: increment(5), // Give 5 coins bonus for referral
      })
    }
  } catch (error) {
    console.error("Error processing referral:", error)
    // Don't throw error here to prevent signup failure
  }
}

/**
 * Generates a unique referral code for a user
 */
// function generateReferralCode(uid: string): string {
//   // Generate a short unique code based on user ID and timestamp
//   const timestamp = Date.now().toString(36)
//   const shortUid = uid.substring(0, 5)
//   return `${shortUid}${timestamp}`.toUpperCase()
// }

/**
 * Helper function to increment a value in Firestore
 */
function increment(amount: number) {
  return {
    __op: "increment",
    amount: amount,
  }
}

// Get user profile from Firestore
export async function getUserProfile(userId: string) {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    }

    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Update user profile in Firestore
export async function updateUserProfile(userId: string, data: any) {
  if (isPreviewOrOffline()) {
    console.log("Mock update user profile:", userId, data)

    // Update mock profile in localStorage
    if (typeof localStorage !== "undefined") {
      const mockProfileJson = localStorage.getItem("mockUserProfile")
      if (mockProfileJson) {
        try {
          const mockProfile = JSON.parse(mockProfileJson)
          const updatedProfile = { ...mockProfile, ...data }
          localStorage.setItem("mockUserProfile", JSON.stringify(updatedProfile))
        } catch (e) {
          console.error("Error updating mock profile:", e)
        }
      }
    }

    return
  }

  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, data)
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Save score to Firestore
export async function saveScore(
  userId: string,
  score: number,
  options: {
    mini: boolean
    grand: boolean
    boosterApplied: boolean
    boosterMultiplier: number
  },
) {
  if (isPreviewOrOffline()) {
    console.log("Mock save score:", userId, score, options)

    // Update mock profile in localStorage
    if (typeof localStorage !== "undefined") {
      const mockProfileJson = localStorage.getItem("mockUserProfile")
      if (mockProfileJson) {
        try {
          const mockProfile = JSON.parse(mockProfileJson)

          // Add score to mock scores
          const newScore = {
            id: `mock-score-${Date.now()}`,
            score,
            timestamp: new Date(),
            tournamentType:
              options.mini && options.grand ? "both" : options.mini ? "mini" : options.grand ? "grand" : null,
            boosterApplied: options.boosterApplied,
            boosterMultiplier: options.boosterMultiplier,
          }

          mockProfile.scores = mockProfile.scores || []
          mockProfile.scores.push(newScore)

          // Update high scores if needed
          if (options.mini && score > (mockProfile.miniHighScore || 0)) {
            mockProfile.miniHighScore = score
            mockProfile.miniHighScoreTimestamp = new Date()
          }

          if (options.grand && score > (mockProfile.grandHighScore || 0)) {
            mockProfile.grandHighScore = score
            mockProfile.grandHighScoreTimestamp = new Date()
          }

          if (score > (mockProfile.highScore || 0)) {
            mockProfile.highScore = score
            mockProfile.highScoreTimestamp = new Date()
          }

          localStorage.setItem("mockUserProfile", JSON.stringify(mockProfile))
          return { id: newScore.id }
        } catch (e) {
          console.error("Error updating mock scores:", e)
        }
      }
    }

    return { id: `mock-score-${Date.now()}` }
  }

  try {
    // Add score to user's scores collection
    const scoreRef = collection(db, "users", userId, "scores")
    const newScore = await addDoc(scoreRef, {
      score,
      timestamp: serverTimestamp(),
      tournamentType: options.mini && options.grand ? "both" : options.mini ? "mini" : options.grand ? "grand" : null,
      boosterApplied: options.boosterApplied,
      boosterMultiplier: options.boosterMultiplier,
    })

    // Update user's high score if needed
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()

      // Update high score for mini tournament
      if (options.mini) {
        const currentHighScore = userData.miniHighScore || 0
        if (score > currentHighScore) {
          await updateDoc(userRef, {
            miniHighScore: score,
            miniHighScoreTimestamp: serverTimestamp(),
          })
        }
      }

      // Update high score for grand tournament
      if (options.grand) {
        const currentHighScore = userData.grandHighScore || 0
        if (score > currentHighScore) {
          await updateDoc(userRef, {
            grandHighScore: score,
            grandHighScoreTimestamp: serverTimestamp(),
          })
        }
      }

      // Update overall high score
      const currentHighScore = userData.highScore || 0
      if (score > currentHighScore) {
        await updateDoc(userRef, {
          highScore: score,
          highScoreTimestamp: serverTimestamp(),
        })
      }
    }

    // Update tournament leaderboards if applicable
    if (options.mini) {
      await updateTournamentLeaderboard("mini", userId, score)
    }

    if (options.grand) {
      await updateTournamentLeaderboard("grand", userId, score)
    }

    // If booster was applied, update booster usage
    if (options.boosterApplied) {
      await updateBoosterUsage(userId)
    }

    return newScore
  } catch (error) {
    console.error("Error saving score:", error)
    throw error
  }
}

// Update tournament leaderboard
async function updateTournamentLeaderboard(tournamentType: "mini" | "grand", userId: string, score: number) {
  if (isPreviewOrOffline()) {
    console.log("Mock update tournament leaderboard:", tournamentType, userId, score)
    return
  }

  try {
    // Get user data for username
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return

    const userData = userSnap.data()
    const username = userData.displayName || userData.email?.split("@")[0] || "Anonymous"

    // Check if user already has an entry in this tournament's leaderboard
    const leaderboardRef = collection(db, "tournaments", tournamentType, "leaderboard")
    const q = query(leaderboardRef, where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // User already has an entry, update if new score is higher
      const docRef = querySnapshot.docs[0].ref
      const currentScore = querySnapshot.docs[0].data().score || 0

      if (score > currentScore) {
        await updateDoc(docRef, {
          score,
          updatedAt: serverTimestamp(),
        })
      }
    } else {
      // Create new leaderboard entry
      await addDoc(leaderboardRef, {
        userId,
        username,
        score,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error(`Error updating ${tournamentType} leaderboard:`, error)
    throw error
  }
}

// Update booster usage
async function updateBoosterUsage(userId: string) {
  if (isPreviewOrOffline()) {
    console.log("Mock update booster usage:", userId)
    return
  }

  try {
    const boosterRef = doc(db, "users", userId, "boosters", "active")
    const boosterSnap = await getDoc(boosterRef)

    if (boosterSnap.exists()) {
      const boosterData = boosterSnap.data()

      // If booster has limited games, decrement the counter
      if (boosterData.remainingGames !== null) {
        const remainingGames = boosterData.remainingGames - 1

        if (remainingGames <= 0) {
          // Booster expired, remove it
          await updateDoc(boosterRef, {
            active: false,
            remainingGames: 0,
            expiredAt: serverTimestamp(),
          })
        } else {
          // Update remaining games
          await updateDoc(boosterRef, {
            remainingGames,
          })
        }
      }

      // Track booster usage
      await addDoc(collection(db, "users", userId, "boosterUsage"), {
        boosterId: boosterData.boosterId,
        multiplier: boosterData.multiplier,
        timestamp: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error updating booster usage:", error)
    throw error
  }
}

// Get tournament data
export async function getTournamentData(userId: string) {
  if (isPreviewOrOffline()) {
    console.log("Returning mock tournament data for preview/offline mode")

    // Generate mock leaderboard data
    const generateMockLeaderboard = (type: string) => {
      const leaderboard = []

      // Create 10 mock entries
      for (let i = 0; i < 10; i++) {
        leaderboard.push({
          id: `mock-${type}-${i}`,
          rank: i + 1,
          userId: `mock-user-${i}`,
          username: `Player${i + 1}`,
          score: 1000 - i * 50,
          createdAt: new Date(Date.now() - i * 86400000),
          updatedAt: new Date(Date.now() - i * 43200000),
        })
      }

      return leaderboard
    }

    // Get user registration status from mock profile
    let userRegistration = {
      mini: true,
      grand: true,
    }

    if (typeof localStorage !== "undefined") {
      const mockProfileJson = localStorage.getItem("mockUserProfile")
      if (mockProfileJson) {
        try {
          const mockProfile = JSON.parse(mockProfileJson)
          userRegistration = {
            mini: mockProfile.tournaments?.mini?.registered || true,
            grand: mockProfile.tournaments?.grand?.registered || true,
          }
        } catch (e) {
          console.error("Error parsing mock profile:", e)
        }
      }
    }

    return {
      userRegistration,
      leaderboards: {
        mini: generateMockLeaderboard("mini"),
        grand: generateMockLeaderboard("grand"),
      },
    }
  }

  try {
    // Get user registration status
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    let userRegistration = {
      mini: false,
      grand: false,
    }

    if (userSnap.exists()) {
      const userData = userSnap.data()

      // Check if tournament payment is still valid (not expired)
      const now = Timestamp.now()

      const miniPaidUntil = userData.tournaments?.mini?.paidUntil
      const grandPaidUntil = userData.tournaments?.grand?.paidUntil

      userRegistration = {
        mini:
          userData.tournaments?.mini?.registered &&
          userData.tournaments?.mini?.paid &&
          (!miniPaidUntil || miniPaidUntil.toDate() > now.toDate()),
        grand:
          userData.tournaments?.grand?.registered &&
          userData.tournaments?.grand?.paid &&
          (!grandPaidUntil || grandPaidUntil.toDate() > now.toDate()),
      }
    }

    // Get mini tournament leaderboard
    const miniLeaderboardRef = collection(db, "tournaments", "mini", "leaderboard")
    const miniQuery = query(miniLeaderboardRef, orderBy("score", "desc"), limit(10))
    const miniSnapshot = await getDocs(miniQuery)
    const miniLeaderboard = miniSnapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data(),
    }))

    // Get grand tournament leaderboard
    const grandLeaderboardRef = collection(db, "tournaments", "grand", "leaderboard")
    const grandQuery = query(grandLeaderboardRef, orderBy("score", "desc"), limit(10))
    const grandSnapshot = await getDocs(grandQuery)
    const grandLeaderboard = grandSnapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data(),
    }))

    return {
      userRegistration,
      leaderboards: {
        mini: miniLeaderboard,
        grand: grandLeaderboard,
      },
    }
  } catch (error) {
    console.error("Error getting tournament data:", error)
    throw error
  }
}

// Register for tournament
export async function registerForTournament(userId: string, tournamentType: "mini" | "grand") {
  if (isPreviewOrOffline()) {
    console.log("Mock register for tournament:", userId, tournamentType)

    // Update mock profile in localStorage
    if (typeof localStorage !== "undefined") {
      const mockProfileJson = localStorage.getItem("mockUserProfile")
      if (mockProfileJson) {
        try {
          const mockProfile = JSON.parse(mockProfileJson)

          // Calculate tournament end date (15 days from now)
          const tournamentEndDate = new Date()
          tournamentEndDate.setDate(tournamentEndDate.getDate() + 15)

          // Update tournament registration status
          if (!mockProfile.tournaments) {
            mockProfile.tournaments = {}
          }

          mockProfile.tournaments[tournamentType] = {
            registered: true,
            paid: true,
            registeredAt: new Date(),
            paidUntil: tournamentEndDate,
          }

          localStorage.setItem("mockUserProfile", JSON.stringify(mockProfile))
        } catch (e) {
          console.error("Error updating mock tournament registration:", e)
        }
      }
    }

    return true
  }

  try {
    const userRef = doc(db, "users", userId)

    // Calculate tournament end date (15 days from now)
    const tournamentEndDate = new Date()
    tournamentEndDate.setDate(tournamentEndDate.getDate() + 15)

    // Update user's tournament registration status
    await updateDoc(userRef, {
      [`tournaments.${tournamentType}.registered`]: true,
      [`tournaments.${tournamentType}.paid`]: true,
      [`tournaments.${tournamentType}.registeredAt`]: serverTimestamp(),
      [`tournaments.${tournamentType}.paidUntil`]: Timestamp.fromDate(tournamentEndDate),
    })

    // Process referral if applicable
    await processReferral(userId, tournamentType)

    // Add payment record
    await addDoc(collection(db, "payments"), {
      userId,
      tournamentType,
      amount: tournamentType === "mini" ? 1 : 10,
      currency: "USDT",
      status: "completed",
      timestamp: serverTimestamp(),
      validUntil: Timestamp.fromDate(tournamentEndDate),
    })

    return true
  } catch (error) {
    console.error("Error registering for tournament:", error)
    throw error
  }
}

// Process referral
export async function processReferral(userId: string, tournamentType: "mini" | "grand" | null = null) {
  if (isPreviewOrOffline()) {
    console.log("Mock process referral:", userId, tournamentType)
    return
  }

  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()

      if (userData.referredBy) {
        const referrerRef = doc(db, "users", userData.referredBy)
        const referrerSnap = await getDoc(referrerRef)

        if (referrerSnap.exists()) {
          // Add referral to referrer's referrals collection
          const referralsRef = collection(db, "users", userData.referredBy, "referrals")
          await addDoc(referralsRef, {
            referredUser: userData.displayName || userData.email?.split("@")[0] || "Anonymous",
            referredUserId: userId,
            tournamentType: tournamentType || null,
            status: "valid",
            reward: 1, // 1 USDT per valid referral
            timestamp: serverTimestamp(),
          })

          // Update referrer's referral balance
          await updateDoc(referrerRef, {
            "balance.referral": incrementFieldValue(1),
          })
        }
      }
    }
  } catch (error) {
    console.error("Error processing referral:", error)
    throw error
  }
}

// Check tournament eligibility
export async function checkTournamentEligibility(userId: string) {
  if (isPreviewOrOffline()) {
    console.log("Mock check tournament eligibility:", userId)

    // Get eligibility from mock profile
    if (typeof localStorage !== "undefined") {
      const mockProfileJson = localStorage.getItem("mockUserProfile")
      if (mockProfileJson) {
        try {
          const mockProfile = JSON.parse(mockProfileJson)

          return {
            mini: mockProfile.tournaments?.mini?.registered || true,
            grand: mockProfile.tournaments?.grand?.registered || true,
            miniHighScore: mockProfile.miniHighScore || 250,
            grandHighScore: mockProfile.grandHighScore || 500,
            highScore: mockProfile.highScore || 500,
            booster: {
              active: true,
              multiplier: 2,
              remainingGames: 50,
            },
          }
        } catch (e) {
          console.error("Error parsing mock profile for eligibility:", e)
        }
      }
    }

    // Default mock eligibility
    return {
      mini: true,
      grand: true,
      miniHighScore: 250,
      grandHighScore: 500,
      highScore: 500,
      booster: {
        active: true,
        multiplier: 2,
        remainingGames: 50,
      },
    }
  }

  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return {
        mini: false,
        grand: false,
      }
    }

    const userData = userSnap.data()

    // Check if tournament payment is still valid (not expired)
    const now = Timestamp.now()

    const miniPaidUntil = userData.tournaments?.mini?.paidUntil
    const grandPaidUntil = userData.tournaments?.grand?.paidUntil

    const miniEligible =
      userData.tournaments?.mini?.registered &&
      userData.tournaments?.mini?.paid &&
      (!miniPaidUntil || miniPaidUntil.toDate() > now.toDate())

    const grandEligible =
      userData.tournaments?.grand?.registered &&
      userData.tournaments?.grand?.paid &&
      (!grandPaidUntil || grandPaidUntil.toDate() > now.toDate())

    // Check for active booster
    const boosterRef = doc(db, "users", userId, "boosters", "active")
    const boosterSnap = await getDoc(boosterRef)
    let booster = null

    if (boosterSnap.exists() && boosterSnap.data().active) {
      booster = boosterSnap.data()
    }

    return {
      mini: miniEligible,
      grand: grandEligible,
      miniHighScore: userData.miniHighScore || 0,
      grandHighScore: userData.grandHighScore || 0,
      highScore: userData.highScore || 0,
      booster,
    }
  } catch (error) {
    console.error("Error checking tournament eligibility:", error)
    throw error
  }
}

// Purchase booster
export async function purchaseBooster(userId: string, boosterId: number, games: number | null) {
  if (isPreviewOrOffline()) {
    console.log("Mock purchase booster:", userId, boosterId, games)

    // Update mock profile in localStorage
    if (typeof localStorage !== "undefined") {
      const mockProfileJson = localStorage.getItem("mockUserProfile")
      if (mockProfileJson) {
        try {
          const mockProfile = JSON.parse(mockProfileJson)

          // Add booster to mock profile
          if (!mockProfile.boosters) {
            mockProfile.boosters = []
          }

          mockProfile.boosters.push({
            id: `mock-booster-${Date.now()}`,
            boosterId,
            games,
            active: true,
            multiplier: 2,
            remainingGames: games,
            purchasedAt: new Date(),
          })

          localStorage.setItem("mockUserProfile", JSON.stringify(mockProfile))
        } catch (e) {
          console.error("Error updating mock boosters:", e)
        }
      }
    }

    return true
  }

  try {
    const boosterRef = doc(db, "users", userId, "boosters", "active")

    // Record the purchase
    await addDoc(collection(db, "boosterPurchases"), {
      userId,
      boosterId,
      games,
      price: boosterId === 1 ? 10 : boosterId === 2 ? 50 : 100,
      timestamp: serverTimestamp(),
    })

    await setDoc(boosterRef, {
      active: true,
      boosterId,
      multiplier: 2, // Double score
      remainingGames: games,
      purchasedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error purchasing booster:", error)
    throw error
  }
}

// Get full tournament leaderboard
export async function getFullLeaderboard(tournamentType: "mini" | "grand") {
  if (isPreviewOrOffline()) {
    console.log("Mock get full leaderboard:", tournamentType)

    // Generate mock leaderboard data
    const leaderboard = []

    // Create 100 mock entries
    for (let i = 0; i < 100; i++) {
      leaderboard.push({
        id: `mock-${tournamentType}-${i}`,
        rank: i + 1,
        userId: `mock-user-${i}`,
        username: `Player${i + 1}`,
        score: 10000 - i * 50,
        createdAt: new Date(Date.now() - i * 86400000),
        updatedAt: new Date(Date.now() - i * 43200000),
      })
    }

    return leaderboard
  }

  try {
    const leaderboardRef = collection(db, "tournaments", tournamentType, "leaderboard")
    const q = query(leaderboardRef, orderBy("score", "desc"), limit(100))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data(),
    }))
  } catch (error) {
    console.error(`Error getting ${tournamentType} leaderboard:`, error)
    throw error
  }
}

// Get referral statistics
export async function getReferralStats(userId: string) {
  if (isPreviewOrOffline()) {
    console.log("Mock get referral stats:", userId)

    // Generate mock referral data
    const referrals = []

    // Create 5 mock referrals
    for (let i = 0; i < 5; i++) {
      referrals.push({
        id: `mock-referral-${i}`,
        referredUser: `ReferredUser${i + 1}`,
        referredUserId: `mock-referred-${i}`,
        tournamentType: i % 2 === 0 ? "mini" : "grand",
        status: i < 3 ? "valid" : "pending",
        reward: i < 3 ? 1 : 0,
        timestamp: new Date(Date.now() - i * 86400000),
      })
    }

    const totalReferrals = referrals.length
    const validReferrals = referrals.filter((ref) => ref.status === "valid").length
    const pendingReferrals = totalReferrals - validReferrals
    const totalEarnings = referrals.reduce((sum, ref) => (ref.status === "valid" ? sum + ref.reward : sum), 0)

    return {
      referrals,
      stats: {
        total: totalReferrals,
        valid: validReferrals,
        pending: pendingReferrals,
        earnings: totalEarnings,
      },
    }
  }

  try {
    const referralsRef = collection(db, "users", userId, "referrals")
    const snapshot = await getDocs(referralsRef)

    const referrals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const totalReferrals = referrals.length
    const validReferrals = referrals.filter((ref) => ref.status === "valid").length
    const pendingReferrals = totalReferrals - validReferrals
    const totalEarnings = referrals.reduce((sum, ref) => (ref.status === "valid" ? sum + ref.reward : sum), 0)

    return {
      referrals,
      stats: {
        total: totalReferrals,
        valid: validReferrals,
        pending: pendingReferrals,
        earnings: totalEarnings,
      },
    }
  } catch (error) {
    console.error("Error getting referral stats:", error)
    throw error
  }
}

// Process withdrawal
export async function processWithdrawal(userId: string, withdrawalData: any) {
  if (isPreviewOrOffline()) {
    console.log("Mock process withdrawal:", userId, withdrawalData)

    // Update mock profile in localStorage
    if (typeof localStorage !== "undefined") {
      const mockProfileJson = localStorage.getItem("mockUserProfile")
      if (mockProfileJson) {
        try {
          const mockProfile = JSON.parse(mockProfileJson)

          // Update balance
          const balanceType = withdrawalData.currency.toLowerCase() === "usdt" ? "available" : "dino"

          if (mockProfile.balance && mockProfile.balance[balanceType] >= withdrawalData.amount) {
            mockProfile.balance[balanceType] -= withdrawalData.amount

            // Add withdrawal to history
            if (!mockProfile.withdrawals) {
              mockProfile.withdrawals = []
            }

            mockProfile.withdrawals.push({
              id: `mock-withdrawal-${Date.now()}`,
              ...withdrawalData,
              status: "pending",
              timestamp: new Date(),
            })

            localStorage.setItem("mockUserProfile", JSON.stringify(mockProfile))
            return true
          } else {
            return false
          }
        } catch (e) {
          console.error("Error updating mock withdrawals:", e)
          return false
        }
      }
    }

    return true
  }

  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      throw new Error("User not found")
    }

    const userData = userSnap.data()
    const balanceType = withdrawalData.currency.toLowerCase() === "usdt" ? "available" : "dino"

    if (userData.balance[balanceType] < withdrawalData.amount) {
      throw new Error("Insufficient balance")
    }

    // Create withdrawal request
    const withdrawalRef = collection(db, "withdrawals")
    await addDoc(withdrawalRef, {
      userId,
      ...withdrawalData,
      status: "pending",
      timestamp: serverTimestamp(),
    })

    // Update user balance
    await updateDoc(userRef, {
      [`balance.${balanceType}`]: incrementFieldValue(-withdrawalData.amount),
    })

    return true
  } catch (error) {
    console.error("Error processing withdrawal:", error)
    throw error
  }
}

// Export Firebase instances
export { auth, db, storage }
