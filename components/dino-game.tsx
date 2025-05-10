"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

// Game constants
const GAME_CONFIG = {
  GRAVITY: 0.6,
  JUMP_FORCE: 12,
  GROUND_HEIGHT: 20,
  GAME_SPEED_START: 6,
  GAME_SPEED_INCREMENT: 0.001,
  OBSTACLE_FREQUENCY_MIN: 50,
  OBSTACLE_FREQUENCY_MAX: 150,
  CLOUD_FREQUENCY: 0.01,
  NIGHT_MODE_FREQUENCY: 0.1, // Chance to switch to night mode
  SCORE_INCREMENT_INTERVAL: 6,
  DINO_WIDTH: 44,
  DINO_HEIGHT: 47,
  DINO_DUCK_HEIGHT: 30,
  BIRD_WIDTH: 46,
  BIRD_HEIGHT: 40,
  CACTUS_SMALL_WIDTH: 17,
  CACTUS_LARGE_WIDTH: 25,
  CACTUS_HEIGHT: 35,
  CLOUD_WIDTH: 46,
  CLOUD_HEIGHT: 14,
  MOON_WIDTH: 20,
  MOON_HEIGHT: 40,
  STAR_SIZE: 3,
  MILESTONE_SCORE: 100, // Score milestone for color flashing
  MILESTONE_FLASH_DURATION: 20, // Frames to flash when reaching milestone
}

// Asset paths
const ASSETS = {
  // Use PNG images for dinosaur character
  DINO_START: "/images/DinoStart.png",
  DINO_DEAD: "/images/DinoDead.png",
  DINO_RUN1: "/images/DinoRun1.png",
  DINO_RUN2: "/images/DinoRun2.png",
  DINO_DUCK1: "/images/DinoDuck1.png",
  DINO_DUCK2: "/images/DinoDuck2.png",
  DINO_JUMP: "/images/DinoJump.png",
  BIRD1: "/images/Bird1.png",
  BIRD2: "/images/Bird2.png",
  // Use PNG images for cactus obstacles
  SMALL_CACTUS1: "/images/SmallCactus1.png",
  SMALL_CACTUS2: "/images/SmallCactus2.png",
  SMALL_CACTUS3: "/images/SmallCactus3.png",
  LARGE_CACTUS1: "/images/LargeCactus1.png",
  LARGE_CACTUS2: "/images/LargeCactus2.png",
  LARGE_CACTUS3: "/images/LargeCactus3.png",
  CLOUD: "/images/Cloud.png",
  TRACK: "/images/Track.png",
  GAME_OVER: "/images/GameOver.png",
  RESET: "/images/Reset.png",
}

// Cactus types
const CACTUS_TYPES = [
  { width: 17, height: 35, type: "small-1", asset: "SMALL_CACTUS1" },
  { width: 34, height: 35, type: "small-2", asset: "SMALL_CACTUS2" },
  { width: 51, height: 35, type: "small-3", asset: "SMALL_CACTUS3" },
  { width: 25, height: 50, type: "large-1", asset: "LARGE_CACTUS1" },
  { width: 50, height: 50, type: "large-2", asset: "LARGE_CACTUS2" },
  { width: 75, height: 50, type: "large-3", asset: "LARGE_CACTUS3" },
]

// Sound effects with improved error handling
const SOUNDS = {
  JUMP: {
    element: typeof Audio !== "undefined" ? new Audio() : null,
    ready: false,
    src: "/sounds/jump.mp3",
  },
  SCORE: {
    element: typeof Audio !== "undefined" ? new Audio() : null,
    ready: false,
    src: "/sounds/score.mp3",
  },
  HIT: {
    element: typeof Audio !== "undefined" ? new Audio() : null,
    ready: false,
    src: "/sounds/hit.mp3",
  },
}

// Game state reference - declared outside the component to avoid issues
const gameStateRef = {
  current: {
    dino: {
      x: 50,
      y: 0,
      width: GAME_CONFIG.DINO_WIDTH,
      height: GAME_CONFIG.DINO_HEIGHT,
      jumping: false,
      ducking: false,
      jumpVelocity: 0,
      runFrame: 0,
      frameCount: 0,
    },
    obstacles: [] as any[],
    clouds: [] as any[],
    stars: [] as any[],
    moon: null as any,
    gameSpeed: GAME_CONFIG.GAME_SPEED_START,
    groundY: 0,
    score: 0,
    frameCount: 0,
    lastObstacleTime: 0,
    gameOver: false,
    animationId: 0,
    nightMode: false,
    blinkTimer: 0,
    trackOffset: 0,
    milestoneReached: false,
    milestoneFlashCounter: 0,
    soundEnabled: true,
  },
}

// Safe sound player function
const playSound = (sound: keyof typeof SOUNDS) => {
  try {
    if (!gameStateRef.current?.soundEnabled) return

    const soundObj = SOUNDS[sound]
    if (!soundObj.element) return

    // Create a new audio element for each play to avoid interruption issues
    const audio = new Audio(soundObj.src)
    audio.volume = 0.5 // Lower volume to be less intrusive

    // Play the sound and ignore any errors
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        // Silently handle the error - don't log to console
      })
    }
  } catch (e) {
    // Silently catch any errors
  }
}

interface DinoGameProps {
  onGameOver: (score: number) => void
  boosterActive?: boolean
  boosterMultiplier?: number
  tournamentType?: "mini" | "grand" | null
  userId?: string
}

export default function DinoGame({
  onGameOver,
  boosterActive = false,
  boosterMultiplier = 1,
  tournamentType = null,
  userId = "",
}: DinoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameActive, setGameActive] = useState(true)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const { toast } = useToast()

  // Game container ref for better fullscreen handling
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Game assets
  const assetsRef = useRef<Record<string, HTMLImageElement>>({})
  const trackPatternRef = useRef<CanvasPattern | null>(null)

  // Check if running on mobile
  const isMobile = useRef(false)
  useEffect(() => {
    isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setShowControls(isMobile.current)
  }, [])

  // Load game assets
  useEffect(() => {
    // Update the loadAsset function to handle image loading
    const loadAsset = (key: string, src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous"

        img.onload = () => {
          assetsRef.current[key] = img
          resolve(img)
        }

        img.onerror = (error) => {
          console.error(`Error loading asset ${key} from ${src}:`, error)
          // Create a fallback colored rectangle for the missing asset
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          // Set canvas size based on asset type
          if (key.includes("DINO")) {
            canvas.width = GAME_CONFIG.DINO_WIDTH
            canvas.height = GAME_CONFIG.DINO_HEIGHT
          } else if (key.includes("BIRD")) {
            canvas.width = GAME_CONFIG.BIRD_WIDTH
            canvas.height = GAME_CONFIG.BIRD_HEIGHT
          } else if (key.includes("SMALL_CACTUS")) {
            canvas.width = key.includes("1") ? 17 : key.includes("2") ? 34 : 51
            canvas.height = GAME_CONFIG.CACTUS_HEIGHT
          } else if (key.includes("LARGE_CACTUS")) {
            canvas.width = key.includes("1") ? 25 : key.includes("2") ? 50 : 75
            canvas.height = 50
          } else if (key === "CLOUD") {
            canvas.width = GAME_CONFIG.CLOUD_WIDTH
            canvas.height = GAME_CONFIG.CLOUD_HEIGHT
          } else if (key === "TRACK") {
            canvas.width = 100
            canvas.height = 1
          } else if (key === "GAME_OVER") {
            canvas.width = 191
            canvas.height = 11
          } else if (key === "RESET") {
            canvas.width = 36
            canvas.height = 32
          } else {
            canvas.width = 30
            canvas.height = 30
          }

          // Fill with a color based on asset type
          if (ctx) {
            if (key.includes("DINO")) {
              ctx.fillStyle = "#535353"
            } else if (key.includes("CACTUS")) {
              ctx.fillStyle = "#2e8b57"
            } else if (key.includes("BIRD")) {
              ctx.fillStyle = "#4682b4"
            } else if (key === "CLOUD") {
              ctx.fillStyle = "#ffffff"
            } else if (key === "TRACK") {
              ctx.fillStyle = "#535353"
            } else {
              ctx.fillStyle = "#cccccc"
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }

          // Use the canvas as a fallback image
          assetsRef.current[key] = canvas as unknown as HTMLImageElement
          resolve(canvas as unknown as HTMLImageElement)
        }

        img.src = src
      })
    }

    const loadAllAssets = async () => {
      try {
        await Promise.all([
          loadAsset("DINO_START", ASSETS.DINO_START),
          loadAsset("DINO_DEAD", ASSETS.DINO_DEAD),
          loadAsset("DINO_RUN1", ASSETS.DINO_RUN1),
          loadAsset("DINO_RUN2", ASSETS.DINO_RUN2),
          loadAsset("DINO_DUCK1", ASSETS.DINO_DUCK1),
          loadAsset("DINO_DUCK2", ASSETS.DINO_DUCK2),
          loadAsset("DINO_JUMP", ASSETS.DINO_JUMP),
          loadAsset("BIRD1", ASSETS.BIRD1),
          loadAsset("BIRD2", ASSETS.BIRD2),
          loadAsset("SMALL_CACTUS1", ASSETS.SMALL_CACTUS1),
          loadAsset("SMALL_CACTUS2", ASSETS.SMALL_CACTUS2),
          loadAsset("SMALL_CACTUS3", ASSETS.SMALL_CACTUS3),
          loadAsset("LARGE_CACTUS1", ASSETS.LARGE_CACTUS1),
          loadAsset("LARGE_CACTUS2", ASSETS.LARGE_CACTUS2),
          loadAsset("LARGE_CACTUS3", ASSETS.LARGE_CACTUS3),
          loadAsset("CLOUD", ASSETS.CLOUD),
          loadAsset("TRACK", ASSETS.TRACK),
          loadAsset("GAME_OVER", ASSETS.GAME_OVER),
          loadAsset("RESET", ASSETS.RESET),
        ])
        console.log("Assets loaded successfully")
        setAssetsLoaded(true)
      } catch (error) {
        console.error("Error in asset loading process:", error)
        // Continue with fallback assets
        setAssetsLoaded(true)
        toast({
          title: "Asset Loading Notice",
          description: "Some game assets couldn't be loaded. Using simplified graphics instead.",
          variant: "default",
        })
      }
    }

    loadAllAssets()

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("dinoHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }

    return () => {
      // Cleanup code if needed
    }
  }, [toast])

  // Initialize game
  useEffect(() => {
    if (!assetsLoaded || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create track pattern with error handling
    try {
      const trackImage = assetsRef.current["TRACK"]
      if (trackImage) {
        trackPatternRef.current = ctx.createPattern(trackImage, "repeat-x")
      }
    } catch (e) {
      console.error("Error creating track pattern:", e)
      trackPatternRef.current = null
    }

    const resizeCanvas = () => {
      // Maintain 4:5 ratio
      const containerWidth = canvas.parentElement?.clientWidth || 600
      const containerHeight = Math.floor(containerWidth * (5 / 4)) // 4:5 ratio

      canvas.width = containerWidth
      canvas.height = containerHeight

      gameStateRef.current.groundY = canvas.height - GAME_CONFIG.GROUND_HEIGHT
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Reset game state
    gameStateRef.current = {
      dino: {
        x: 50,
        y: 0,
        width: GAME_CONFIG.DINO_WIDTH,
        height: GAME_CONFIG.DINO_HEIGHT,
        jumping: false,
        ducking: false,
        jumpVelocity: 0,
        runFrame: 0,
        frameCount: 0,
      },
      obstacles: [],
      clouds: [],
      stars: [],
      moon: null,
      gameSpeed: GAME_CONFIG.GAME_SPEED_START,
      groundY: canvas.height - GAME_CONFIG.GROUND_HEIGHT,
      score: 0,
      frameCount: 0,
      lastObstacleTime: 0,
      gameOver: false,
      animationId: 0,
      nightMode: false,
      blinkTimer: 0,
      trackOffset: 0,
      milestoneReached: false,
      milestoneFlashCounter: 0,
      soundEnabled: true,
    }

    // Generate initial clouds
    for (let i = 0; i < 3; i++) {
      generateCloud(Math.random() * canvas.width)
    }

    // Start game loop
    gameLoop()

    // Event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === "Space" || e.code === "ArrowUp") &&
        !gameStateRef.current.dino.jumping &&
        !gameStateRef.current.gameOver
      ) {
        e.preventDefault()
        jump()
      } else if (e.code === "ArrowDown") {
        e.preventDefault()
        gameStateRef.current.dino.ducking = true
        gameStateRef.current.dino.height = GAME_CONFIG.DINO_DUCK_HEIGHT
      } else if (e.code === "KeyR" && gameStateRef.current.gameOver) {
        restartGame()
      } else if (e.code === "KeyM") {
        // Toggle sound
        gameStateRef.current.soundEnabled = !gameStateRef.current.soundEnabled
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") {
        gameStateRef.current.dino.ducking = false
        gameStateRef.current.dino.height = GAME_CONFIG.DINO_HEIGHT
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (!gameStateRef.current.gameOver) {
        e.preventDefault()
        // Don't handle touch events here if using on-screen controls
        if (!isMobile.current) {
          jump()
        }
      } else {
        // Restart on touch if game over
        restartGame()
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (gameStateRef.current.gameOver) {
        // Check if click is on reset button
        const resetBtnX = canvas.width / 2 - 17
        const resetBtnY = canvas.height / 2 + 10
        const resetBtnWidth = 36
        const resetBtnHeight = 32

        if (
          e.offsetX >= resetBtnX &&
          e.offsetX <= resetBtnX + resetBtnWidth &&
          e.offsetY >= resetBtnY &&
          e.offsetY <= resetBtnY + resetBtnHeight
        ) {
          restartGame()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("click", handleClick)

    // Jump function
    function jump() {
      if (gameStateRef.current.dino.jumping) return

      gameStateRef.current.dino.jumping = true
      gameStateRef.current.dino.jumpVelocity = -GAME_CONFIG.JUMP_FORCE

      // Play jump sound
      playSound("JUMP")
    }

    // Duck function
    function duck() {
      if (!gameStateRef.current.dino.jumping) {
        gameStateRef.current.dino.ducking = true
        gameStateRef.current.dino.height = GAME_CONFIG.DINO_DUCK_HEIGHT
      }
    }

    // Stop ducking
    function stopDuck() {
      gameStateRef.current.dino.ducking = false
      gameStateRef.current.dino.height = GAME_CONFIG.DINO_HEIGHT
    }

    // Restart game
    function restartGame() {
      // Reset game state
      gameStateRef.current.dino = {
        x: 50,
        y: 0,
        width: GAME_CONFIG.DINO_WIDTH,
        height: GAME_CONFIG.DINO_HEIGHT,
        jumping: false,
        ducking: false,
        jumpVelocity: 0,
        runFrame: 0,
        frameCount: 0,
      }
      gameStateRef.current.obstacles = []
      gameStateRef.current.gameSpeed = GAME_CONFIG.GAME_SPEED_START
      gameStateRef.current.score = 0
      gameStateRef.current.frameCount = 0
      gameStateRef.current.lastObstacleTime = 0
      gameStateRef.current.gameOver = false
      gameStateRef.current.milestoneReached = false
      gameStateRef.current.milestoneFlashCounter = 0

      // Reset UI state
      setScore(0)
      setGameActive(true)

      // Restart game loop
      gameLoop()
    }

    // Game loop
    function gameLoop() {
      if (gameStateRef.current.gameOver) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update game state
      updateGameState()

      // Draw game elements
      drawGame()

      // Request next frame
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop)
    }

    // Update game state
    function updateGameState() {
      const state = gameStateRef.current

      // Update dino position
      if (state.dino.jumping) {
        state.dino.y += state.dino.jumpVelocity
        state.dino.jumpVelocity += GAME_CONFIG.GRAVITY

        // Check if dino landed
        if (state.dino.y >= 0) {
          state.dino.y = 0
          state.dino.jumping = false
          state.dino.jumpVelocity = 0
        }
      }

      // Update frame count for animation
      state.frameCount++
      state.dino.frameCount++

      // Update dino animation frame
      if (state.dino.frameCount >= 6) {
        state.dino.runFrame = state.dino.runFrame === 0 ? 1 : 0
        state.dino.frameCount = 0
      }

      // Generate obstacles
      if (
        state.frameCount - state.lastObstacleTime >
        GAME_CONFIG.OBSTACLE_FREQUENCY_MIN + Math.random() * GAME_CONFIG.OBSTACLE_FREQUENCY_MAX
      ) {
        generateObstacle()
        state.lastObstacleTime = state.frameCount
      }

      // Generate clouds
      if (Math.random() < GAME_CONFIG.CLOUD_FREQUENCY) {
        generateCloud(canvas.width)
      }

      // Toggle night mode occasionally
      if (state.frameCount % 1000 === 0 && Math.random() < GAME_CONFIG.NIGHT_MODE_FREQUENCY) {
        state.nightMode = !state.nightMode

        // Generate stars and moon for night mode
        if (state.nightMode) {
          generateStars()
          generateMoon()
        } else {
          state.stars = []
          state.moon = null
        }
      }

      // Update obstacles
      for (let i = 0; i < state.obstacles.length; i++) {
        const obstacle = state.obstacles[i]
        obstacle.x -= state.gameSpeed

        // Update bird animation
        if (obstacle.type === "bird") {
          obstacle.frameCount++
          if (obstacle.frameCount >= 15) {
            obstacle.frame = obstacle.frame === 0 ? 1 : 0
            obstacle.frameCount = 0
          }
        }

        // Check collision
        if (checkCollision(state.dino, obstacle)) {
          handleGameOver()
          return
        }

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
          state.obstacles.splice(i, 1)
          i--
        }
      }

      // Update clouds
      for (let i = 0; i < state.clouds.length; i++) {
        const cloud = state.clouds[i]
        cloud.x -= state.gameSpeed * 0.5

        // Remove off-screen clouds
        if (cloud.x + cloud.width < 0) {
          state.clouds.splice(i, 1)
          i--
        }
      }

      // Update track offset
      state.trackOffset = (state.trackOffset - state.gameSpeed) % 100

      // Update score
      if (state.frameCount % GAME_CONFIG.SCORE_INCREMENT_INTERVAL === 0) {
        state.score++
        setScore(state.score)

        // Check for milestone (every 100 points)
        if (state.score % GAME_CONFIG.MILESTONE_SCORE === 0 && state.score > 0) {
          state.milestoneReached = true
          state.milestoneFlashCounter = GAME_CONFIG.MILESTONE_FLASH_DURATION

          // Play score milestone sound
          playSound("SCORE")
        }
      }

      // Update milestone flash counter
      if (state.milestoneFlashCounter > 0) {
        state.milestoneFlashCounter--
        if (state.milestoneFlashCounter === 0) {
          state.milestoneReached = false
        }
      }

      // Increase game speed over time
      state.gameSpeed += GAME_CONFIG.GAME_SPEED_INCREMENT
    }

    // Draw game elements
    function drawGame() {
      const state = gameStateRef.current
      const assets = assetsRef.current

      // Draw background (white for day, dark for night)
      ctx.fillStyle = state.nightMode ? "#262626" : "#f7f7f7"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars in night mode
      if (state.nightMode && state.stars.length > 0) {
        ctx.fillStyle = "#ffffff"
        for (const star of state.stars) {
          // Make stars blink
          if (Math.random() > 0.99) {
            star.visible = !star.visible
          }
          if (star.visible) {
            ctx.fillRect(star.x, star.y, star.size, star.size)
          }
        }
      }

      // Draw moon in night mode
      if (state.nightMode && state.moon) {
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(state.moon.x, state.moon.y, state.moon.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw moon crater
        ctx.fillStyle = "#e7e7e7"
        ctx.beginPath()
        ctx.arc(state.moon.x + 5, state.moon.y - 5, state.moon.radius / 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw clouds
      for (const cloud of state.clouds) {
        if (assets["CLOUD"]) {
          ctx.drawImage(assets["CLOUD"], cloud.x, cloud.y, cloud.width, cloud.height)
        } else {
          // Fallback for cloud
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height)
        }
      }

      // Draw ground track
      if (assets["TRACK"]) {
        // Draw the track image repeatedly
        const trackImg = assets["TRACK"]
        const trackWidth = trackImg.width || 100

        // Calculate how many repetitions we need to cover the canvas width
        const repetitions = Math.ceil(canvas.width / trackWidth) + 1

        // Draw the track with the offset
        for (let i = 0; i < repetitions; i++) {
          const x = ((i * trackWidth + state.trackOffset) % (trackWidth * repetitions)) - trackWidth
          ctx.drawImage(trackImg, x, state.groundY, trackWidth, trackImg.height || 1)
        }
      } else {
        // Fallback if track image failed to load
        ctx.fillStyle = state.nightMode ? "#5a5a5a" : "#535353"
        ctx.fillRect(0, state.groundY, canvas.width, 1)
      }

      // Draw dino
      let dinoImage

      if (state.gameOver) {
        dinoImage = assets.DINO_DEAD
      } else if (state.dino.jumping) {
        dinoImage = assets.DINO_JUMP
      } else if (state.dino.ducking) {
        dinoImage = state.dino.runFrame === 0 ? assets.DINO_DUCK1 : assets.DINO_DUCK2
      } else {
        dinoImage = state.dino.runFrame === 0 ? assets.DINO_RUN1 : assets.DINO_RUN2
      }

      if (dinoImage) {
        try {
          ctx.drawImage(
            dinoImage,
            state.dino.x,
            state.groundY - state.dino.height - Math.abs(state.dino.y),
            state.dino.width,
            state.dino.height,
          )
        } catch (e) {
          // Fallback for dino
          ctx.fillStyle = "#535353"
          ctx.fillRect(
            state.dino.x,
            state.groundY - state.dino.height - Math.abs(state.dino.y),
            state.dino.width,
            state.dino.height,
          )
        }
      }

      // Draw obstacles
      for (const obstacle of state.obstacles) {
        try {
          if (obstacle.type === "bird") {
            const birdImage = obstacle.frame === 0 ? assets.BIRD1 : assets.BIRD2
            if (birdImage) {
              ctx.drawImage(birdImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height)
            }
          } else {
            // Draw cactus using the appropriate asset
            const cactusImage = assets[obstacle.asset]
            if (cactusImage) {
              ctx.drawImage(cactusImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height)
            } else {
              // Fallback for cactus
              ctx.fillStyle = "#2e8b57"
              ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
            }
          }
        } catch (e) {
          // Fallback for any drawing errors
          ctx.fillStyle = obstacle.type === "bird" ? "#4682b4" : "#2e8b57"
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        }
      }

      // Draw score
      ctx.fillStyle =
        state.milestoneReached && state.milestoneFlashCounter % 4 < 2
          ? "#ff5722"
          : state.nightMode
            ? "#ffffff"
            : "#535353"
      ctx.font = "bold 14px monospace"
      ctx.textAlign = "right"

      // Display score with booster indicator if active
      if (boosterActive) {
        ctx.fillText(`${state.score} x${boosterMultiplier}`, canvas.width - 10, 20)
      } else {
        ctx.fillText(`${state.score}`, canvas.width - 10, 20)
      }

      // Draw high score
      if (highScore > 0) {
        ctx.textAlign = "left"
        ctx.fillText(`HI ${highScore}`, 10, 20)
      }

      // Draw tournament info if applicable
      if (tournamentType) {
        ctx.textAlign = "center"
        ctx.fillText(`${tournamentType === "mini" ? "Mini" : "Grand"} Tournament`, canvas.width / 2, 20)
      }

      // Draw game over screen
      if (state.gameOver) {
        // Draw game over text
        if (assets["GAME_OVER"]) {
          const gameOverImg = assets["GAME_OVER"]
          ctx.drawImage(
            gameOverImg,
            canvas.width / 2 - gameOverImg.width / 2,
            canvas.height / 2 - 50,
            gameOverImg.width,
            gameOverImg.height,
          )
        } else {
          // Fallback for game over text
          ctx.fillStyle = state.nightMode ? "#ffffff" : "#535353"
          ctx.textAlign = "center"
          ctx.font = "bold 20px monospace"
          ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30)
        }

        // Draw reset button
        if (assets["RESET"]) {
          const resetImg = assets["RESET"]
          ctx.drawImage(
            resetImg,
            canvas.width / 2 - resetImg.width / 2,
            canvas.height / 2 + 10,
            resetImg.width,
            resetImg.height,
          )
        } else {
          // Fallback for reset button
          ctx.fillStyle = state.nightMode ? "#ffffff" : "#535353"
          ctx.beginPath()
          ctx.arc(canvas.width / 2, canvas.height / 2 + 30, 15, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Generate obstacle
    function generateObstacle() {
      const type = Math.random() < 0.8 ? "cactus" : "bird"
      let obstacle

      if (type === "cactus") {
        const cactusType = CACTUS_TYPES[Math.floor(Math.random() * CACTUS_TYPES.length)]
        obstacle = {
          x: canvas.width,
          y: gameStateRef.current.groundY - cactusType.height,
          width: cactusType.width,
          height: cactusType.height,
          type: "cactus",
          asset: cactusType.asset,
        }
      } else {
        const birdY = gameStateRef.current.groundY - 50 - Math.random() * 50
        obstacle = {
          x: canvas.width,
          y: birdY,
          width: GAME_CONFIG.BIRD_WIDTH,
          height: GAME_CONFIG.BIRD_HEIGHT,
          type: "bird",
          frame: 0,
          frameCount: 0,
        }
      }

      gameStateRef.current.obstacles.push(obstacle)
    }

    // Generate cloud
    function generateCloud(x: number) {
      const cloud = {
        x: x,
        y: 20 + Math.random() * 50,
        width: GAME_CONFIG.CLOUD_WIDTH,
        height: GAME_CONFIG.CLOUD_HEIGHT,
      }
      gameStateRef.current.clouds.push(cloud)
    }

    // Generate stars
    function generateStars() {
      const numStars = 50 + Math.random() * 50
      for (let i = 0; i < numStars; i++) {
        const star = {
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height - 50),
          size: GAME_CONFIG.STAR_SIZE,
          visible: true,
        }
        gameStateRef.current.stars.push(star)
      }
    }

    // Generate moon
    function generateMoon() {
      gameStateRef.current.moon = {
        x: canvas.width - 50,
        y: 50,
        radius: 20,
      }
    }

    // Check collision
    function checkCollision(dino: any, obstacle: any) {
      // Add a smaller hitbox for better gameplay
      const hitboxReduction = 4 // pixels to reduce from each side

      const dinoRect = {
        x: dino.x + hitboxReduction,
        y: gameStateRef.current.groundY - dino.height - Math.abs(dino.y) + hitboxReduction,
        width: dino.width - hitboxReduction * 2,
        height: dino.height - hitboxReduction * 2,
      }

      const obstacleRect = {
        x: obstacle.x + hitboxReduction,
        y: obstacle.y + hitboxReduction,
        width: obstacle.width - hitboxReduction * 2,
        height: obstacle.height - hitboxReduction * 2,
      }

      return (
        dinoRect.x < obstacleRect.x + obstacleRect.width &&
        dinoRect.x + dinoRect.width > obstacleRect.x &&
        dinoRect.y < obstacleRect.y + obstacleRect.height &&
        dinoRect.y + dinoRect.height > obstacleRect.y
      )
    }

    // Handle game over
    function handleGameOver() {
      gameStateRef.current.gameOver = true
      setGameActive(false)

      // Play hit sound
      playSound("HIT")

      // Save high score
      if (gameStateRef.current.score > highScore) {
        localStorage.setItem("dinoHighScore", gameStateRef.current.score.toString())
        setHighScore(gameStateRef.current.score)
      }

      // Call the onGameOver prop
      onGameOver(gameStateRef.current.score)
    }

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("click", handleClick)
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(gameStateRef.current.animationId)
    }
  }, [assetsLoaded, onGameOver, highScore, toast, boosterActive, boosterMultiplier, tournamentType])

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        ref={gameContainerRef}
        className="relative w-full max-w-2xl mx-auto rounded-t-lg overflow-hidden shadow-lg"
        style={{ aspectRatio: "4/5" }}
      >
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>

      {/* Black control panel */}
      <div className="w-full max-w-2xl mx-auto bg-black p-4 rounded-b-lg shadow-lg">
        <div className="flex justify-center gap-6">
          <button
            onClick={() => {
              if (!gameStateRef.current.dino.jumping && !gameStateRef.current.gameOver) {
                const event = new KeyboardEvent("keydown", { code: "Space" })
                window.dispatchEvent(event)
              }
            }}
            className="px-8 py-4 bg-green-600/80 text-white font-bold rounded-lg text-lg shadow-lg"
          >
            Jump
          </button>
          <button
            onTouchStart={() => {
              gameStateRef.current.dino.ducking = true
              gameStateRef.current.dino.height = GAME_CONFIG.DINO_DUCK_HEIGHT
              const event = new KeyboardEvent("keydown", { code: "ArrowDown" })
              window.dispatchEvent(event)
            }}
            onTouchEnd={() => {
              gameStateRef.current.dino.ducking = false
              gameStateRef.current.dino.height = GAME_CONFIG.DINO_HEIGHT
              const event = new KeyboardEvent("keyup", { code: "ArrowDown" })
              window.dispatchEvent(event)
            }}
            className="px-8 py-4 bg-blue-600/80 text-white font-bold rounded-lg text-lg shadow-lg"
          >
            Duck
          </button>
        </div>
      </div>

      {!gameStarted && (
        <div className="mt-4 flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => {
              setGameStarted(true)
              const event = new KeyboardEvent("keydown", { code: "Space" })
              window.dispatchEvent(event)
            }}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg px-8"
          >
            Start Game
          </Button>
        </div>
      )}
    </div>
  )
}
