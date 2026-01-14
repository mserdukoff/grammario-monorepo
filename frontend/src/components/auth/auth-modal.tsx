"use client"

/**
 * Authentication Modal
 * 
 * Combined login/signup modal with email and Google OAuth.
 */
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Loader2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">(defaultMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "login") {
        await signIn(email, password)
        toast.success("Welcome back!")
        onClose()
      } else if (mode === "signup") {
        if (!displayName.trim()) {
          toast.error("Please enter your name")
          setLoading(false)
          return
        }
        await signUp(email, password, displayName)
        toast.success("Account created! Welcome to Grammario!")
        onClose()
      } else if (mode === "reset") {
        await resetPassword(email)
        toast.success("Password reset email sent!")
        setMode("login")
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Authentication failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success("Welcome to Grammario!")
      onClose()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google sign-in failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-indigo-950/50 to-transparent">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <h2 className="text-2xl font-bold">
                {mode === "login" && "Welcome Back"}
                {mode === "signup" && "Create Account"}
                {mode === "reset" && "Reset Password"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {mode === "login" && "Sign in to continue your learning journey"}
                {mode === "signup" && "Join thousands of language learners"}
                {mode === "reset" && "We'll send you a reset link"}
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {mode !== "reset" && (
                <Button
                  variant="outline"
                  className="w-full h-12 bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              )}

              {mode !== "reset" && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-12 px-4 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-12 pl-11 pr-4 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {mode !== "reset" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 px-4 pr-11 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" && "Sign In"}
                      {mode === "signup" && "Create Account"}
                      {mode === "reset" && "Send Reset Link"}
                    </>
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center text-sm text-slate-400 space-y-2 pt-2">
                {mode === "login" && (
                  <>
                    <button
                      onClick={() => setMode("reset")}
                      className="hover:text-indigo-400 transition-colors"
                    >
                      Forgot password?
                    </button>
                    <p>
                      Don&apos;t have an account?{" "}
                      <button
                        onClick={() => setMode("signup")}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Sign up
                      </button>
                    </p>
                  </>
                )}
                {mode === "signup" && (
                  <p>
                    Already have an account?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode === "reset" && (
                  <button
                    onClick={() => setMode("login")}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
