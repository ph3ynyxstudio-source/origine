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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4 flex justify-center"
      >
        <div className="h-28 w-28 rounded-full border border-white/12 bg-[radial-gradient(circle_at_30%_30%,rgba(142,242,255,0.3),transparent_42%),radial-gradient(circle_at_70%_68%,rgba(200,140,255,0.26),transparent_48%),linear-gradient(180deg,rgba(15,23,48,0.95),rgba(7,11,22,0.92))] shadow-[0_0_40px_rgba(126,235,255,0.08)] sm:h-36 sm:w-36" />
      </motion.div>

      <Card className="lunar-card">
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
