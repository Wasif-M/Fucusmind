import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useCheckins, useCreateCheckin } from "@/hooks/use-checkins";
import { insertCheckinSchema, type InsertCheckin } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Smile, Moon, Activity, Check, ClipboardEdit } from "lucide-react";
import { isToday, format } from "date-fns";

export function CheckinDialog({ trigger, forDate }: { trigger?: React.ReactNode; forDate?: Date } = {}) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateCheckin();
  const { data: checkins } = useCheckins();

  const targetDate = forDate || new Date();
  const isForToday = isToday(targetDate);

  const existingCheckin = useMemo(() => {
    if (!checkins) return null;
    const targetDateKey = format(targetDate, 'yyyy-MM-dd');
    return checkins.find((c) => c.createdAt!.toString().split('T')[0] === targetDateKey) || null;
  }, [checkins, targetDate]);

  const form = useForm<InsertCheckin>({
    resolver: zodResolver(insertCheckinSchema),
    defaultValues: {
      moodScore: 5,
      sleepHours: 7,
      stressLevel: 5,
      notes: "",
    },
  });

  const onSubmit = (data: InsertCheckin) => {
    const payload = isForToday
      ? data
      : { 
          ...data, 
          forDate: format(targetDate, "yyyy-MM-dd'T'23:59:59")
        };
    mutate(payload as any, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  if (existingCheckin && !trigger) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-green-500/20 bg-green-500/5">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white" data-testid="text-checkin-done">
            {isForToday ? "Today's Check-in Done" : "Check-in Recorded"}
          </p>
          <p className="text-xs text-muted-foreground">
            Mood {existingCheckin.moodScore}/10 · Sleep {existingCheckin.sleepHours}h · Stress {existingCheckin.stressLevel}/10
          </p>
        </div>
      </div>
    );
  }

  if (existingCheckin && trigger) {
    return <>{trigger}</>;
  }

  const dateLabel = isForToday ? "Today" : format(targetDate, "MMM d");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-checkin-open" size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            <ClipboardEdit className="mr-2 h-5 w-5" /> {isForToday ? "Today's Check-in" : `Check-in for ${dateLabel}`}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-panel border-white/10 sm:max-w-[500px] bg-zinc-950/90 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center">
            {isForToday ? "Daily Reflection" : `Reflection for ${format(targetDate, "EEEE, MMM d")}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium flex items-center gap-2">
                <Smile className="w-4 h-4 text-yellow-400" /> Mood
              </Label>
              <span className="text-sm text-muted-foreground font-mono">{form.watch("moodScore")}/10</span>
            </div>
            <Slider 
              min={1} 
              max={10} 
              step={1} 
              value={[form.watch("moodScore")]} 
              onValueChange={(val) => form.setValue("moodScore", val[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Low</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" /> Sleep Hours
              </Label>
              <span className="text-sm text-muted-foreground font-mono">{form.watch("sleepHours")}h</span>
            </div>
            <Slider 
              min={0} 
              max={12} 
              step={1} 
              value={[form.watch("sleepHours")]} 
              onValueChange={(val) => form.setValue("sleepHours", val[0])}
              className="py-2"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" /> Stress Level
              </Label>
              <span className="text-sm text-muted-foreground font-mono">{form.watch("stressLevel")}/10</span>
            </div>
            <Slider 
              min={1} 
              max={10} 
              step={1} 
              value={[form.watch("stressLevel")]} 
              onValueChange={(val) => form.setValue("stressLevel", val[0])}
              className="py-2"
            />
             <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Calm</span>
              <span>Overwhelmed</span>
            </div>
          </div>

          <Button 
            data-testid="button-checkin-submit"
            type="submit" 
            className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
              </>
            ) : (
              "Complete Check-in"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
