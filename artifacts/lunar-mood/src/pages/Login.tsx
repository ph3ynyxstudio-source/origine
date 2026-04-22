import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError(t("fillAllFields"));
      return;
    }

    try {
      if (isRegistering) {
        await registerMutation.mutateAsync({ data: { username, password } });
      } else {
        await loginMutation.mutateAsync({ data: { username, password } });
      }
      await queryClient.invalidateQueries();
      setLocation("/dashboard");
    } catch {
      setError(t("somethingWentWrong"));
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background image declared in requirements */}
      <img
        src={`${import.meta.env.BASE_URL}images/cosmic-bg.png`}
        alt="Cosmic Background"
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-block mb-4">
        <img
          src={`${import.meta.env.BASE_URL}images/splash-icon.png`}
          alt="LunarMood Splash"
          className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-[0_0_25px_rgba(126,235,255,0.22)]"
        />
      </motion.div>

      <Card className="border-white/10 backdrop-blur-2xl bg-black/40">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                {t("username")}
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="stargazer_99"
                className="h-14"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                {t("password")}
              </label>
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
              isLoading={isLoading}>
              {isRegistering
                ? t("launchAccount") || "Launch Account"
                : t("enterOrbit")}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-muted-foreground text-sm">
              {isRegistering ? t("hasAccount") : t("noAccount")}{" "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="text-primary hover:text-accent font-medium transition-colors text-sm">
              {isRegistering ? t("logIn") || "Log In" : t("createAccount")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
