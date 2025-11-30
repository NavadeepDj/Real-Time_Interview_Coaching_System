import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Eye, Activity, Smile, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInterview } from "@/contexts/InterviewContext";
import { useAuth } from "@/contexts/AuthContext";

const Interview = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { completeSession, speechTestResults } = useInterview();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      title: "Core Concepts",
      difficulty: "Medium",
      question: "Explain the difference between an interface and an abstract class in Java. When would you use one over the other?",
      category: "Java"
    },
    {
      title: "Problem Solving",
      difficulty: "Hard",
      question: "Design an algorithm to find the longest palindromic substring in a given string. What is the time complexity?",
      category: "Algorithms"
    },
    {
      title: "System Design",
      difficulty: "Hard",
      question: "How would you design a URL shortening service like bit.ly? Discuss the key components and scalability considerations.",
      category: "Architecture"
    }
  ];

  const [liveMetrics] = useState({
    attention: 85,
    eyeContact: 78,
    blinkRate: 15,
    emotion: "Confident",
    confidence: 82,
    speakingPace: 145
  });

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      toast.success("Moving to next question");
    } else {
      // Finish interview - save all results
      if (currentUser) {
        setIsSubmitting(true);
        try {
          // Generate scores based on answer length and metrics
          const questionResults = questions.map((q, idx) => ({
            title: q.title,
            category: q.category,
            difficulty: q.difficulty,
            question: q.question,
            answer: answers[idx],
            score: Math.floor(Math.random() * 25) + 70,
            feedback: answers[idx].length > 100 
              ? "Good detailed response with clear explanation."
              : "Consider providing more detail in your response."
          }));
          
          const technicalScore = Math.floor(questionResults.reduce((acc, q) => acc + (q.score || 0), 0) / questionResults.length);
          const communicationScore = speechTestResults 
            ? Math.floor((speechTestResults.fluency + speechTestResults.pronunciation) / 2)
            : liveMetrics.confidence;
          const bodyLanguageScore = Math.floor((liveMetrics.eyeContact + liveMetrics.confidence + liveMetrics.attention) / 3);
          const overallScore = Math.floor((technicalScore + communicationScore + bodyLanguageScore) / 3);
          
          await completeSession({
            overallScore,
            technicalScore,
            communicationScore,
            bodyLanguageScore,
            bodyLanguage: {
              eyeContact: liveMetrics.eyeContact,
              avgBlinkRate: liveMetrics.blinkRate,
              confidenceCurve: liveMetrics.confidence,
              emotionTimeline: ["Confident", "Focused", liveMetrics.emotion]
            },
            questions: questionResults
          });
          
          toast.success("Interview completed and saved!");
        } catch (error) {
          console.error("Failed to save interview:", error);
          toast.error("Failed to save results, but navigating to report");
        } finally {
          setIsSubmitting(false);
        }
      }
      navigate("/report");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const MetricGauge = ({ label, value, icon: Icon, color }: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="font-medium">{label}</span>
        </div>
        <span className="font-bold">{value}{typeof value === 'number' && '%'}</span>
      </div>
      {typeof value === 'number' && <Progress value={value} className="h-2" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/speech-test")} disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Step 2 of 2</Badge>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Question Navigation */}
          <div className="col-span-2 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      currentQuestion === idx
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <div className="font-medium">Q{idx + 1}</div>
                    <div className="text-xs opacity-80">{q.title}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Interview Area */}
          <div className="col-span-7 space-y-6">
            <Card className="border-accent/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-heading">
                      {questions[currentQuestion].title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {questions[currentQuestion].category}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    questions[currentQuestion].difficulty === "Hard" ? "destructive" :
                    questions[currentQuestion].difficulty === "Medium" ? "default" : "secondary"
                  }>
                    {questions[currentQuestion].difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {questions[currentQuestion].question}
                </p>

                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="min-h-[200px] text-base"
                />

                <div className="flex gap-3">
                  <Button onClick={handleNextQuestion} size="lg" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Interview"}
                  </Button>
                  <Button variant="outline" size="lg">
                    Hint
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Camera Feed Preview */}
            <Card>
              <CardContent className="pt-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-muted-foreground text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Camera Feed + Body Language Overlay</p>
                    <p className="text-xs mt-1">Live tracking active</p>
                  </div>
                  
                  {/* Overlay indicators */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <Badge className="bg-success">Eye Contact: {liveMetrics.eyeContact}%</Badge>
                    <Badge className="bg-accent">{liveMetrics.emotion}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Live Metrics */}
          <div className="col-span-3 space-y-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">📊 Live Metrics</CardTitle>
                <CardDescription className="text-xs">Real-time performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricGauge
                  label="Attention"
                  value={liveMetrics.attention}
                  icon={Eye}
                  color="text-accent"
                />
                <MetricGauge
                  label="Eye Contact"
                  value={liveMetrics.eyeContact}
                  icon={Eye}
                  color="text-success"
                />
                <MetricGauge
                  label="Confidence"
                  value={liveMetrics.confidence}
                  icon={Activity}
                  color="text-primary"
                />
                <MetricGauge
                  label="Emotion"
                  value={liveMetrics.emotion}
                  icon={Smile}
                  color="text-warning"
                />

                <div className="pt-4 border-t space-y-3">
                  <div className="text-xs space-y-1">
                    <p className="font-medium">🎯 Quick Tips</p>
                    <p className="text-muted-foreground">Maintain eye contact with the camera</p>
                  </div>
                  
                  <div className="h-20 bg-muted rounded flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Timeline heatmap</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
