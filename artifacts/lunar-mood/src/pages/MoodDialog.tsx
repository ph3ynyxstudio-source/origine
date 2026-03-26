import { useState, useEffect } from "react"
import { useCreateMood, useUpdateMood, useDeleteMood } from "@workspace/api-client-react"
import type { MoodEntry } from "@workspace/api-client-react"
import { useTranslation } from "@/lib/i18n"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMoodColor, getMoodEmoji } from "@/lib/utils"
import { X, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQueryClient } from "@tanstack/react-query"
import { getListMoodsQueryKey } from "@workspace/api-client-react"

export function MoodDialog({ 
  date, 
  existingEntries = [], 
  onClose 
}: { 
  date: string, 
  existingEntries: MoodEntry[], 
  onClose: () => void 
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [activePeriod, setActivePeriod] = useState<"morning" | "afternoon" | "evening">("morning")
  
  const createMutation = useCreateMood()
  const updateMutation = useUpdateMood()
  const deleteMutation = useDeleteMood()

  const [formData, setFormData] = useState({
    mood: 3,
    energy: 50,
    consumption: 0,
    note: ""
  })
  
  const currentEntry = existingEntries.find(e => e.period === activePeriod)

  useEffect(() => {
    if (currentEntry) {
      setFormData({
        mood: currentEntry.mood,
        energy: currentEntry.energy || 50,
        consumption: currentEntry.consumption || 0,
        note: currentEntry.note || ""
      })
    } else {
      setFormData({ mood: 3, energy: 50, consumption: 0, note: "" })
    }
  }, [activePeriod, currentEntry])

  const handleSave = async () => {
    const payload = {
      date,
      period: activePeriod,
      ...formData
    }
    
    try {
      if (currentEntry) {
        await updateMutation.mutateAsync({ id: currentEntry.id, data: formData })
      } else {
        await createMutation.mutateAsync({ data: payload })
      }
      queryClient.invalidateQueries({ queryKey: getListMoodsQueryKey() })
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async () => {
    if (!currentEntry) return
    try {
      await deleteMutation.mutateAsync({ id: currentEntry.id })
      queryClient.invalidateQueries({ queryKey: getListMoodsQueryKey() })
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  const moodOptions = [
    { value: 1, label: t("terrible") },
    { value: 2, label: t("bad") },
    { value: 3, label: t("okay") },
    { value: 4, label: t("good") },
    { value: 5, label: t("great") },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg"
      >
        <Card className="border-white/10 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h2 className="text-xl font-display font-bold text-white">{date}</h2>
              <p className="text-sm text-muted-foreground">{t("addMood")}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Period Tabs */}
          <div className="flex border-b border-white/10 bg-white/5">
            {(["morning", "afternoon", "evening"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-colors relative
                  ${activePeriod === period ? "text-primary" : "text-muted-foreground hover:text-white"}`}
              >
                {t(period)}
                {existingEntries.find(e => e.period === period) && (
                  <span className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-white/30" />
                )}
                {activePeriod === period && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto">
            {/* Emotion */}
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-4 block">{t("emotion")}</label>
              <div className="flex justify-between gap-2">
                {moodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData(prev => ({ ...prev, mood: opt.value }))}
                    className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl flex-1 transition-all border
                      ${formData.mood === opt.value 
                        ? 'bg-white/10 border-primary/50 shadow-[0_0_15px_rgba(124,106,250,0.3)]' 
                        : 'border-white/5 hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                  >
                    <span className="text-2xl sm:text-3xl filter drop-shadow-md">{getMoodEmoji(opt.value)}</span>
                    <span className="text-[10px] sm:text-xs font-medium" style={{ color: formData.mood === opt.value ? getMoodColor(opt.value) : undefined }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Slider */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-foreground/80">{t("energy")}</label>
                <span className="text-primary font-bold">{formData.energy}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={formData.energy}
                onChange={(e) => setFormData(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none bg-white/10 accent-primary"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) ${formData.energy}%, rgba(255,255,255,0.1) ${formData.energy}%)`
                }}
              />
            </div>

            {/* Consumption & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-4 block">{t("conso")}</label>
                <div className="flex justify-between gap-1">
                  {[0,1,2,3,4,5].map(val => (
                    <button
                      key={val}
                      onClick={() => setFormData(prev => ({ ...prev, consumption: val }))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all border
                        ${formData.consumption === val 
                          ? 'bg-accent text-white border-accent' 
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">{t("noteOptional")}</label>
                <Input 
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="..."
                  className="bg-black/20"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 mt-4 border-t border-white/10">
              {currentEntry && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={handleDelete}
                  isLoading={deleteMutation.isPending}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                className="flex-1" 
                onClick={onClose}
              >
                {t("cancel")}
              </Button>
              <Button 
                className="flex-[2]" 
                onClick={handleSave}
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {t("save")}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
