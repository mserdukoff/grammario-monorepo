"use client"

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-md hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <h2 className="font-heading text-2xl italic">
                {mode === "login" && "Welcome back"}
                {mode === "signup" && "Create account"}
                {mode === "reset" && "Reset password"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {mode === "login" && "Sign in to continue learning"}
                {mode === "signup" && "Start your language journey"}
                {mode === "reset" && "We'll send you a reset link"}
              </p>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {mode !== "reset" && (
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-10 pl-9 pr-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                      required
                    />
                  </div>
                </div>

                {mode !== "reset" && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full h-10 px-3 pr-10 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" && "Sign in"}
                      {mode === "signup" && "Create account"}
                      {mode === "reset" && "Send reset link"}
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground space-y-1.5 pt-1">
                {mode === "login" && (
                  <>
                    <button
                      onClick={() => setMode("reset")}
                      className="hover:text-foreground transition-colors block mx-auto"
                    >
                      Forgot password?
                    </button>
                    <p>
                      No account?{" "}
                      <button
                        onClick={() => setMode("signup")}
                        className="text-primary hover:text-primary/80 font-medium"
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
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode === "reset" && (
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary hover:text-primary/80 font-medium"
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
