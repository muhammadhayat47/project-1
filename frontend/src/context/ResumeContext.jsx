import { createContext, useContext, useState, useCallback } from "react";

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [resumeText, setResumeTextState] = useState(() => localStorage.getItem("careeros_resume_text") || "");
  const [resumeFileName, setResumeFileNameState] = useState(() => localStorage.getItem("careeros_resume_filename") || "");
  const [skills, setSkillsState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("careeros_resume_skills") || "[]");
    } catch {
      return [];
    }
  });

  const setResume = useCallback((text, fileName, extractedSkills = []) => {
    setResumeTextState(text);
    setResumeFileNameState(fileName || "");
    setSkillsState(extractedSkills);
    localStorage.setItem("careeros_resume_text", text || "");
    localStorage.setItem("careeros_resume_filename", fileName || "");
    localStorage.setItem("careeros_resume_skills", JSON.stringify(extractedSkills || []));
  }, []);

  const clearResume = useCallback(() => {
    setResume("", "", []);
  }, [setResume]);

  return (
    <ResumeContext.Provider value={{ resumeText, resumeFileName, skills, setResume, clearResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
}
