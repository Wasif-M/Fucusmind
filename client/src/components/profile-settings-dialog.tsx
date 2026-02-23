import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsDialog({ open, onOpenChange }: ProfileSettingsDialogProps) {
  const { user } = useAuth();
  const { profile, updateProfileAsync, isUpdating } = useProfile();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [stressFrequency, setStressFrequency] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [exerciseExperience, setExerciseExperience] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setEmail(profile.email || "");
      setAge(profile.age || undefined);
      setPrimaryGoal(profile.primaryGoal || "");
      setStressFrequency(profile.stressFrequency || "");
      setSleepQuality(profile.sleepQuality || "");
      setExerciseExperience(profile.exerciseExperience || "");
      setPreferredTime(profile.preferredTime || "");
      setFocusAreas(profile.focusAreas || []);
    } else if (user) {
      setDisplayName(`${user.firstName || ""} ${user.lastName || ""}`.trim() || "");
      setEmail(user.email || "");
    }
  }, [profile, user]);

  const handleSave = async () => {
    try {
      await updateProfileAsync({
        displayName,
        email,
        age: age || undefined,
        primaryGoal,
        stressFrequency,
        sleepQuality,
        exerciseExperience,
        preferredTime,
        focusAreas,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const focusAreaOptions = [
    "Stress Management",
    "Better Sleep",
    "Emotional Balance",
    "Mindfulness Practice",
    "Self-Care",
    "Mental Clarity",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-white/10 bg-zinc-950/90 text-foreground max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-white">Profile Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your personal information and preferences. Changes will be reflected across the app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium text-white">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium text-white">Age</Label>
            <Input
              id="age"
              type="number"
              value={age || ""}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Your age"
              className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryGoal" className="text-sm font-medium text-white">Primary Wellness Goal</Label>
            <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
              <SelectTrigger id="primaryGoal" className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select your primary goal" className="text-muted-foreground" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="reduce_stress">Reduce stress</SelectItem>
                <SelectItem value="improve_sleep">Improve sleep</SelectItem>
                <SelectItem value="emotional_balance">Emotional balance</SelectItem>
                <SelectItem value="mindfulness">Build mindfulness practice</SelectItem>
                <SelectItem value="self_care">Better self-care routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stressFrequency" className="text-sm font-medium text-white">How often do you feel stressed?</Label>
            <Select value={stressFrequency} onValueChange={setStressFrequency}>
              <SelectTrigger id="stressFrequency" className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select frequency" className="text-muted-foreground" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="rarely">Rarely</SelectItem>
                <SelectItem value="sometimes">Sometimes</SelectItem>
                <SelectItem value="often">Often</SelectItem>
                <SelectItem value="very_often">Very often</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sleepQuality" className="text-sm font-medium text-white">Sleep Quality</Label>
            <Select value={sleepQuality} onValueChange={setSleepQuality}>
              <SelectTrigger id="sleepQuality" className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select your sleep quality" className="text-muted-foreground" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exerciseExperience" className="text-sm font-medium text-white">Mindfulness Experience</Label>
            <Select value={exerciseExperience} onValueChange={setExerciseExperience}>
              <SelectTrigger id="exerciseExperience" className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select your experience level" className="text-muted-foreground" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredTime" className="text-sm font-medium text-white">Preferred Practice Time</Label>
            <Select value={preferredTime} onValueChange={setPreferredTime}>
              <SelectTrigger id="preferredTime" className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select preferred time" className="text-muted-foreground" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">Focus Areas</Label>
            <div className="grid grid-cols-2 gap-3">
              {focusAreaOptions.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={focusAreas.includes(area)}
                    onCheckedChange={() => toggleFocusArea(area)}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={area}
                    className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {area}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isUpdating}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
