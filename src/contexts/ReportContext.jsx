import { createContext, useContext, useState, useCallback } from 'react';

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  const [uploadContent, setUploadContent] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [truncatedPages, setTruncatedPages] = useState(null);

  const clearAll = useCallback(() => {
    setUploadContent(null);
    setUserContext(null);
    setAnalysisResult(null);
    setTruncatedPages(null);
  }, []);

  return (
    <ReportContext.Provider value={{
      uploadContent, setUploadContent,
      userContext, setUserContext,
      analysisResult, setAnalysisResult,
      truncatedPages, setTruncatedPages,
      clearAll,
    }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error('useReport must be used within ReportProvider');
  return ctx;
}
