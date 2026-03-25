import { useState } from "react";
import { motion } from "framer-motion";
import { useAppAuth } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Redirect, useLocation } from "wouter";
import { Moon } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";

export default function AuthPage() {
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false } });
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useAppAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (isUserLoading) return <div className="min-h-screen bg-background" />;
  if (user) return <Redirect to="/" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Validation Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const action = isLogin ? login : register;
    
    action.mutate(
      { data: { username, password } },
      {
        onSuccess: () => {
          toast({ title: "Success", description: isLogin ? "Welcome back!" : "Account created successfully" });
          setLocation("/");
        },
        onError: (err: any) => {
          toast({ 
            title: "Authentication Failed", 
            description: err.response?.data?.error || "Something went wrong", 
            variant: "destructive" 
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Abstract Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/celestial-bg.png`}
          alt="Celestial Background"
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="glass rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(167,139,250,0.4)]">
            <Moon className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-4xl font-display font-bold mb-2 text-gradient">LunarMood</h1>
          <p className="text-muted-foreground mb-8">Align your orbit with the stars.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 text-left">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg rounded-xl mt-6 shadow-[0_0_20px_rgba(167,139,250,0.3)]"
              disabled={login.isPending || register.isPending}
            >
              {login.isPending || register.isPending ? "Connecting..." : isLogin ? "Enter Orbit" : "Begin Journey"}
            </Button>
          </form>

          <div className="mt-8 text-sm text-muted-foreground">
            {isLogin ? "New to the cosmos? " : "Already traversing? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline focus:outline-none"
            >
              {isLogin ? "Create an account" : "Log in here"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
