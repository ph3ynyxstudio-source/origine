import { useState } from "react"
import { useLocation } from "wouter"
import { useLogin, useRegister } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { MoonStar } from "lucide-react"
import { motion } from "framer-motion"

export default function Login() {
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const queryClient = useQueryClient()
  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!username || !password) {
      setError(t("fillAllFields"))
      return
    }

    try {
      if (isRegistering) {
        await registerMutation.mutateAsync({ data: { username, password } })
      } else {
        await loginMutation.mutateAsync({ data: { username, password } })
      }
      await queryClient.invalidateQueries()
      setLocation("/dashboard")
    } catch {
      setError(t("somethingWentWrong"))
    }
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background image declared in requirements */}
      <img 
        src={`${import.meta.env.BASE_URL}images/cosmic-bg.png`}
        alt="Cosmic Background"
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen pointer-events-none"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <MoonStar className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(124,106,250,0.8)]" />
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold cosmic-gradient-text mb-3">
            {t("loginTitle")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("loginSubtitle")}</p>
        </div>

        <Card className="border-white/10 backdrop-blur-2xl bg-black/40">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 pl-1">{t("username")}</label>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="stargazer_99"
                  className="h-14"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 pl-1">{t("password")}</label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg mt-4" 
                isLoading={isLoading}
              >
                {isRegistering ? t("launchAccount") || "Launch Account" : t("enterOrbit")}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-muted-foreground text-sm">
                {isRegistering ? t("hasAccount") : t("noAccount")}{" "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering)
                  setError("")
                }}
                className="text-primary hover:text-accent font-medium transition-colors text-sm"
              >
                {isRegistering ? t("logIn") || "Log In" : t("createAccount")}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
