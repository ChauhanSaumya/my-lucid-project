"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const PRODUCTS: Record<
  string,
  {
    name: string
    verdict: string
    score: number
    color: string
    insights: { title: string; description: string }[]
    nutrients: { name: string; value: string }[]
    reasoning: string[]
  }
> = {
  yogurt: {
    name: "Greek Yogurt - Plain",
    verdict: "Safe for Daily Consumption",
    score: 85,
    color: "from-emerald-400 to-teal-500",
    insights: [
      {
        title: "High Protein Content",
        description: "Contains 15g of protein per serving. Excellent for muscle recovery and satiety.",
      },
      {
        title: "Live Cultures Present",
        description: "Contains Lactobacillus bulgaricus and Streptococcus thermophilus. Supports gut health.",
      },
      {
        title: "Low Sugar",
        description: "Only 4g of naturally occurring lactose. No added sugars detected.",
      },
    ],
    nutrients: [
      { name: "Sugar", value: "4g" },
      { name: "Protein", value: "15g" },
      { name: "Fat", value: "2g" },
      { name: "Sodium", value: "50g" },
    ],
    reasoning: [
      "Logic: Analyzing ingredient list → 2 ingredients detected",
      "Cross-referencing: Milk (organic) → FDA approved, no additives",
      "Cross-referencing: Live cultures → Beneficial probiotics identified",
      "Calculating: Protein content 15g → All lactose (natural milk sugar)",
      "Verdict: Clean ingredient profile → No red flags",
      "Classification: Safe for daily consumption",
    ],
  },
  cereal: {
    name: "Kids' Breakfast Cereal",
    verdict: "Proceed with Caution",
    score: 42,
    color: "from-amber-400 to-orange-500",
    insights: [
      {
        title: "High Sugar Content",
        description: "Contains 12g of added sugars per serving. Exceeds recommended daily intake for children.",
      },
      {
        title: "Artificial Sweeteners",
        description: "Contains sucralose and aspartame. FDA approved but use in moderation recommended.",
      },
      {
        title: "Multiple Additives",
        description: "Contains 8 artificial colors and preservatives. May affect sensitive individuals.",
      },
    ],
    nutrients: [
      { name: "Sugar", value: "12g" },
      { name: "Protein", value: "2g" },
      { name: "Fat", value: "1g" },
      { name: "Sodium", value: "180mg" },
    ],
    reasoning: [
      "Logic: Analyzing ingredient list → 15 ingredients detected",
      "Cross-referencing: Sucralose → FDA approved synthetic sweetener",
      "Cross-referencing: Yellow 5, Red 40 → Approved but controversial",
      "Calculating: Sugar content 12g → High for children",
      "Verdict: Multiple concerns identified → Moderation recommended",
      "Classification: Not ideal for daily consumption",
    ],
  },
  protein: {
    name: "Protein Bar",
    verdict: "Generally Safe",
    score: 68,
    color: "from-blue-400 to-cyan-500",
    insights: [
      {
        title: "Good Protein Source",
        description: "Contains 20g of plant-based protein. Excellent post-workout snack.",
      },
      {
        title: "Sugar Alcohols Present",
        description: "Uses maltitol and erythritol as sweeteners. May cause digestive discomfort in some.",
      },
      {
        title: "Moderate Processing",
        description: "Contains whey protein isolate and natural flavors. Minimal artificial additives.",
      },
    ],
    nutrients: [
      { name: "Sugar", value: "2g" },
      { name: "Protein", value: "20g" },
      { name: "Fat", value: "8g" },
      { name: "Sodium", value: "200mg" },
    ],
    reasoning: [
      "Logic: Analyzing ingredient list → 18 ingredients detected",
      "Cross-referencing: Whey protein isolate → High quality protein source",
      "Cross-referencing: Sugar alcohols → GRAS status confirmed",
      "Calculating: Macro ratio optimized → 20g protein, minimal sugar",
      "Verdict: Good nutritional profile → Minor concerns noted",
      "Classification: Safe for regular consumption",
    ],
  },
}

export default function App() {
  const [screen, setScreen] = useState<"landing" | "upload" | "scanning" | "result">("landing")
  const [selectedProduct, setSelectedProduct] = useState<string>("yogurt")
  const [scanText, setScanText] = useState("")
  const [activeTab, setActiveTab] = useState<"insights" | "nutrients">("insights")
  const [showReasoning, setShowReasoning] = useState(false)
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null) // added state to store uploaded image
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const product = PRODUCTS[selectedProduct]

  const scanMessages = [
    "Identifying text...",
    "Extracting ingredients...",
    "Accessing regulatory database...",
    "Cross-referencing FDA guidelines...",
    "Synthesizing context...",
    "Generating insights...",
  ]

  // useEffect for camera initialization
  useEffect(() => {
    if (screen === "scanning" && videoRef.current && !cameraStream && !uploadedImage) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          setCameraStream(stream)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error("[v0] Camera access error:", err)
          // Fallback to demo mode if camera access denied
          setScreen("scanning")
        })
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
        setCameraStream(null)
      }
    }
  }, [screen, cameraStream, uploadedImage])

  useEffect(() => {
    if (screen === "scanning") {
      let messageIndex = 0
      const interval = setInterval(() => {
        setScanText(scanMessages[messageIndex])
        messageIndex = (messageIndex + 1) % scanMessages.length
      }, 500)

      const timeout = setTimeout(() => {
        clearInterval(interval)
        setScreen("result")
      }, 3000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [screen])

  useEffect(() => {
    if (screen === "result") {
      setDisplayScore(0)
      const duration = 1500
      const steps = 60
      const increment = product.score / steps
      const stepDuration = duration / steps

      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        setDisplayScore(Math.min(Math.round(increment * currentStep), product.score))

        if (currentStep >= steps) {
          clearInterval(timer)
          setDisplayScore(product.score)
        }
      }, stepDuration)

      return () => clearInterval(timer)
    }
  }, [screen, product.score])

  const handleScanLive = () => {
    setScreen("scanning")
    setActiveTab("insights")
    setShowReasoning(false)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setUploadedImage(imageData) // store the uploaded image
        setScreen("scanning")
        simulateScan()
      }
      reader.readAsDataURL(file)
    }
  }

  const simulateScan = () => {
    // Simulate scan logic here
  }

  const handleBack = () => {
    setScreen("landing")
    setDisplayScore(0)
    setScanText("")
    setUploadedImage(null) // clear uploaded image on back
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
  }

  const changeScenario = (scenario: string) => {
    setSelectedProduct(scenario)
    setScenarioMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
          >
            {/* L.U.C.I.D. Title */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-8xl font-black text-black mb-2 text-center tracking-tight"
            >
              L.U.C.I.D.
            </motion.h1>

            {/* Full Form Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base font-semibold text-teal-600 mb-2 text-center"
            >
              Label Understanding & Consumer Insight Decoder
            </motion.p>

            {/* The Interface for Truth */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl font-light text-black mb-8 text-center"
            >
              The Interface for Truth
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-center max-w-2xl mb-16 leading-relaxed"
            >
              Decode every ingredient. Expose hidden additives. Make informed decisions about what you consume.
            </motion.p>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl w-full"
            >
              {[
                {
                  title: "AI-Powered Analysis",
                  description: "Advanced algorithms decode complex ingredient lists instantly.",
                  icon: "🧠",
                },
                {
                  title: "Regulatory Database Access",
                  description: "Cross-reference with FDA and health authority guidelines.",
                  icon: "📋",
                },
                {
                  title: "Instant Results",
                  description: "Get comprehensive health insights in seconds.",
                  icon: "⚡",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group bg-teal-50 border border-teal-200 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-teal-400 transition-all"
                >
                  {/* Minimal icons - just simple lines */}
                  <div className="flex items-center justify-center w-8 h-8 mb-3 text-teal-600">
                    {idx === 0 && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    {idx === 1 && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    {idx === 2 && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8"
            >
              <button
                onClick={handleScanLive}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-semibold transition-colors"
              >
                Scan Product Live
              </button>

              <span className="text-gray-400">or</span>

              <button
                onClick={handleUploadClick}
                className="px-8 py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-full font-semibold transition-colors"
              >
                Upload Product Image
              </button>
            </motion.div>

            {/* Info text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xs text-gray-500 text-center"
            >
              Camera or Upload · JPG/PNG supported · No account required · 100% secure
            </motion.p>

            {/* Scenario Selector */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="fixed bottom-6 left-6"
            >
              <div className="relative">
                <button
                  onClick={() => setScenarioMenuOpen(!scenarioMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <span>Scenario: {PRODUCTS[selectedProduct].name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {scenarioMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {Object.entries(PRODUCTS).map(([key, product]) => (
                      <button
                        key={key}
                        onClick={() => changeScenario(key)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {product.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {screen === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6 relative overflow-hidden"
          >
            {uploadedImage ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-950 p-8">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded product"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            ) : cameraStream ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />
            )}

            {/* Animated grid overlay */}
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                backgroundImage:
                  "linear-gradient(rgba(20,184,166,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.5) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            {/* Scanning lines animation */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/20 to-transparent"
                style={{ transform: "translateY(-100%)", animation: "scan 3s infinite linear" }}
              />
            </motion.div>

            {/* Focus square */}
            <motion.div
              className="absolute w-80 h-80 border-2 border-green-400 rounded-lg z-20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.9, 1.1, 0.9],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />

            {/* Corner indicators */}
            <motion.div className="absolute w-80 h-80 z-20 pointer-events-none">
              {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
                <div key={i} className={`absolute w-4 h-4 border-2 border-green-400 ${pos}`} />
              ))}
            </motion.div>

            <div className="absolute top-8 left-6 right-6 z-10 font-mono text-xs text-green-400 space-y-1 max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <span className="text-gray-500">{">"}</span> Initializing neural network...
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-teal-400"
                >
                  {" "}
                  ✓
                </motion.span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <span className="text-gray-500">{">"}</span> Loading product database...
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-teal-400"
                >
                  {" "}
                  ✓
                </motion.span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                <span className="text-gray-500">{">"}</span> Analyzing image...
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="text-teal-400"
                >
                  {" "}
                  ✓
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="text-teal-300 font-semibold"
              >
                <span className="text-gray-500">{">"}</span> {scanText}
              </motion.div>
            </div>

            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleBack}
              className="absolute bottom-8 left-6 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-medium transition-colors z-50"
            >
              Cancel
            </motion.button>
          </motion.div>
        )}

        {screen === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white py-12 px-6"
          >
            <div className="max-w-2xl mx-auto">
              {/* Back button */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBack}
                className="mb-8 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                ← Back
              </motion.button>

              {/* Product name */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-gray-900 mb-8 text-center"
              >
                {product.name}
              </motion.h2>

              {/* Circular score with progress */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-12"
              >
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg
                    className="absolute inset-0 transform -rotate-90"
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 200"
                  >
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      strokeWidth="8"
                      stroke={displayScore >= 75 ? "#14b8a6" : displayScore >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - displayScore / 100)}`}
                      strokeLinecap="round"
                      transition={{ duration: 0.05 }}
                    />
                  </svg>

                  <div className="text-center z-10">
                    <motion.div className="text-5xl font-bold text-gray-900 tabular-nums">{displayScore}</motion.div>
                    <div className="text-xs text-gray-500 mt-2 font-medium">HEALTH SCORE</div>
                  </div>
                </div>
              </motion.div>

              {/* Verdict */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center mb-8"
              >
                <p className="text-lg font-semibold text-teal-900">{product.verdict}</p>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-8 border-b border-gray-200 mb-8"
              >
                {["insights", "nutrients"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as "insights" | "nutrients")}
                    className={`pb-3 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "insights" ? "Key Insights" : "Nutrient Breakdown"}
                  </button>
                ))}
              </motion.div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {activeTab === "insights" && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 mb-8"
                  >
                    {product.insights.map((insight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-teal-200 rounded-xl p-4"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "nutrients" && (
                  <motion.div
                    key="nutrients"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 mb-8"
                  >
                    {product.nutrients.map((nutrient, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700">{nutrient.name}</span>
                        <span className="text-sm font-semibold text-gray-900">{nutrient.value}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reasoning toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="border-t border-gray-200 pt-6"
              >
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center justify-between w-full p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900">Show AI Reasoning</span>
                  <motion.span animate={{ rotate: showReasoning ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    ↓
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showReasoning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-950 rounded-xl p-4 font-mono text-xs text-green-400 space-y-2 overflow-hidden"
                    >
                      {product.reasoning.map((line, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <span className="text-teal-400">{">"}</span> {line}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Scan another button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleBack}
                className="w-full mt-8 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors"
              >
                Scan Another Product
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
