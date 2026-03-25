import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('ld-theme') || 'light');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('ld-large-text') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('ld-high-contrast') === 'true');
  const [simpleMode, setSimpleMode] = useState(() => localStorage.getItem('ld-simple-mode') === 'true');
  const [unitSystem, setUnitSystem] = useState(() => localStorage.getItem('ld-unit-system') || 'conventional');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ld-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-large-text', largeText);
    localStorage.setItem('ld-large-text', largeText);
  }, [largeText]);

  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', highContrast);
    localStorage.setItem('ld-high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('ld-simple-mode', simpleMode);
  }, [simpleMode]);

  useEffect(() => {
    localStorage.setItem('ld-unit-system', unitSystem);
  }, [unitSystem]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const toggleLargeText = () => setLargeText(v => !v);
  const toggleHighContrast = () => setHighContrast(v => !v);
  const toggleSimpleMode = () => setSimpleMode(v => !v);

  return (
    <ThemeContext.Provider value={{
      theme, toggleTheme,
      largeText, toggleLargeText,
      highContrast, toggleHighContrast,
      simpleMode, toggleSimpleMode,
      unitSystem, setUnitSystem,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
