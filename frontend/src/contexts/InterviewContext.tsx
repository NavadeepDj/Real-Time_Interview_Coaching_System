import { createContext, useContext, useState, ReactNode } from "react";
import { 
  createInterviewSession, 
  saveSpeechTestResults, 
  saveInterviewResults,
  completeInterviewSession,
  getInterviewSession,
  type InterviewSession,
  type SpeechTestResult,
  type InterviewQuestion,
  type BodyLanguageMetrics
} from "@/lib/firestore";
import { useAuth } from "./AuthContext";

interface InterviewContextType {
  sessionId: string | null;
  session: InterviewSession | null;
  isLoading: boolean;
  
  // Session management
  startNewSession: () => Promise<string>;
  loadSession: (sessionId: string) => Promise<void>;
  
  // Save results
  saveSpeechTest: (results: SpeechTestResult) => Promise<void>;
  saveInterview: (questions: InterviewQuestion[], liveMetrics: InterviewSession["liveMetrics"]) => Promise<void>;
  completeSession: (finalResults: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    bodyLanguageScore: number;
    bodyLanguage: BodyLanguageMetrics;
    questions: InterviewQuestion[];
  }) => Promise<void>;
  
  // Local state for in-progress data
  speechTestResults: SpeechTestResult | null;
  setSpeechTestResults: (results: SpeechTestResult) => void;
  interviewAnswers: string[];
  setInterviewAnswers: (answers: string[]) => void;
}

const InterviewContext = createContext<InterviewContextType | null>(null);

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
};

interface InterviewProviderProps {
  children: ReactNode;
}

export const InterviewProvider = ({ children }: InterviewProviderProps) => {
  const { currentUser } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Local state for in-progress interview
  const [speechTestResults, setSpeechTestResults] = useState<SpeechTestResult | null>(null);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>(["", "", ""]);

  const startNewSession = async (): Promise<string> => {
    if (!currentUser) throw new Error("User must be logged in");
    
    setIsLoading(true);
    try {
      const newSessionId = await createInterviewSession(currentUser.uid);
      setSessionId(newSessionId);
      setSpeechTestResults(null);
      setInterviewAnswers(["", "", ""]);
      return newSessionId;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const loadedSession = await getInterviewSession(id);
      if (loadedSession) {
        setSession(loadedSession);
        setSessionId(id);
        if (loadedSession.speechTest) {
          setSpeechTestResults(loadedSession.speechTest);
        }
        if (loadedSession.questions) {
          setInterviewAnswers(loadedSession.questions.map(q => q.answer));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveSpeechTest = async (results: SpeechTestResult): Promise<void> => {
    if (!sessionId) {
      // Create a new session if one doesn't exist
      if (currentUser) {
        const newSessionId = await startNewSession();
        await saveSpeechTestResults(newSessionId, results);
      }
    } else {
      await saveSpeechTestResults(sessionId, results);
    }
    setSpeechTestResults(results);
  };

  const saveInterview = async (
    questions: InterviewQuestion[], 
    liveMetrics: InterviewSession["liveMetrics"]
  ): Promise<void> => {
    if (!sessionId) throw new Error("No active session");
    await saveInterviewResults(sessionId, questions, liveMetrics);
  };

  const completeSession = async (finalResults: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    bodyLanguageScore: number;
    bodyLanguage: BodyLanguageMetrics;
    questions: InterviewQuestion[];
  }): Promise<void> => {
    if (!sessionId) throw new Error("No active session");
    await completeInterviewSession(sessionId, finalResults);
    
    // Reload the session to get updated data
    await loadSession(sessionId);
  };

  const value: InterviewContextType = {
    sessionId,
    session,
    isLoading,
    startNewSession,
    loadSession,
    saveSpeechTest,
    saveInterview,
    completeSession,
    speechTestResults,
    setSpeechTestResults,
    interviewAnswers,
    setInterviewAnswers
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
