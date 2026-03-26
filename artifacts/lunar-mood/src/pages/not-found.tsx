import { useTranslation } from "@/lib/i18n"
import { MoonStar } from "lucide-react"
import { Link } from "wouter"

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <MoonStar className="w-16 h-16 text-primary/40 mb-6" />
      <h1 className="text-4xl font-display font-bold text-white mb-4">404</h1>
      <p className="text-muted-foreground text-lg mb-8">{t("notLogged")}</p>
      <Link href="/dashboard" className="text-primary hover:text-accent transition-colors font-medium">
        {t("home")}
      </Link>
    </div>
  )
}
