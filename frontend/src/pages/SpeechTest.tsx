import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInterview } from "@/contexts/InterviewContext";
import { useAuth } from "@/contexts/AuthContext";

const SpeechTest = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { saveSpeechTest, startNewSession, sessionId } = useInterview();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [metrics, setMetrics] = useState({
    fluency: 0,
    fillerWords: 0,
    pace: 0,
    pronunciation: 0,
  });

  const prompt = "Describe a recent project you worked on and explain your role in it. What challenges did you face and how did you overcome them?";

  const startRecording = () => {
    // Start recording immediately - don't wait for Firebase
    setIsRecording(true);
    setRecordingTime(0);
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    toast.success("Recording started");
    
    // Create session in background if user is logged in and no session exists
    if (currentUser && !sessionId) {
      startNewSession().catch((error) => {
        console.error("Failed to create session:", error);
      });
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const finalRecordingTime = recordingTime;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Simulate analysis
    setTimeout(async () => {
      const newMetrics = {
        fluency: Math.floor(Math.random() * 30) + 70,
        fillerWords: Math.floor(Math.random() * 10) + 2,
        pace: Math.floor(Math.random() * 40) + 120,
        pronunciation: Math.floor(Math.random() * 25) + 75,
      };
      
      setMetrics(newMetrics);
      setHasRecorded(true);
      
      // Save to Firebase if user is logged in
      if (currentUser) {
        setIsSaving(true);
        try {
          await saveSpeechTest({
            ...newMetrics,
            recordingDuration: finalRecordingTime
          });
          toast.success("Speech test results saved!");
        } catch (error) {
          console.error("Failed to save results:", error);
          toast.error("Failed to save results, but you can continue");
        } finally {
          setIsSaving(false);
        }
      } else {
        toast.success("Speech analyzed successfully");
      }
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const MetricCard = ({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>
            {value}
            <span className="text-lg text-muted-foreground ml-1">{unit}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Step 1 of 2</Badge>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-3">
            Speech Accuracy Assessment
          </h1>
          <p className="text-lg text-muted-foreground">
            Evaluate your pronunciation, fluency, and communication clarity
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📝 Your Prompt
              </CardTitle>
              <CardDescription>Read this prompt aloud or respond naturally</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{prompt}</p>
              <div className="mt-4 flex gap-2">
                <Badge variant="outline">Min duration: 20s</Badge>
                <Badge variant="outline">Speak clearly</Badge>
                <Badge variant="outline">Natural pace</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-primary text-primary-foreground">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full bg-primary-foreground/10 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}>
                    <Mic className="h-16 w-16" />
                  </div>
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary-foreground/30 animate-ping" />
                  )}
                </div>

                <div className="text-center">
                  <div className="text-5xl font-heading font-bold mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-primary-foreground/80">
                    {isRecording ? "Recording in progress..." : hasRecorded ? "Recording complete" : "Ready to record"}
                  </p>
                </div>

                {!isRecording ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={startRecording}
                    className="gap-2"
                  >
                    <Mic className="h-5 w-5" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopRecording}
                    className="gap-2"
                  >
                    <Square className="h-5 w-5" />
                    Stop Recording
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {hasRecorded && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>📊 Instant Metrics</CardTitle>
                  <CardDescription>Your speech analysis results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Fluency Score</span>
                      <span className="text-sm font-bold text-success">{metrics.fluency}/100</span>
                    </div>
                    <Progress value={metrics.fluency} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <MetricCard
                      label="Filler Words"
                      value={metrics.fillerWords}
                      unit="times"
                      color="text-warning"
                    />
                    <MetricCard
                      label="Speaking Pace"
                      value={metrics.pace}
                      unit="WPM"
                      color="text-accent"
                    />
                    <MetricCard
                      label="Pronunciation"
                      value={metrics.pronunciation}
                      unit="/100"
                      color="text-success"
                    />
                  </div>

                  <Card className="bg-muted mt-4">
                    <CardContent className="pt-4">
                      <p className="text-sm">
                        <strong>💡 Tip:</strong> {metrics.fillerWords > 5 
                          ? "Try to reduce filler words like 'um' and 'uh'. Take brief pauses instead."
                          : "Great job! Your speech is clear with minimal filler words."}
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate("/interview")}
              >
                Continue to Interview Section
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechTest;
