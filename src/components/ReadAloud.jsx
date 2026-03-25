import { useState, useRef } from 'react';

export default function ReadAloud({ text }) {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  const toggle = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  if (!('speechSynthesis' in window)) return null;

  return (
    <button onClick={toggle} className="btn btn-ghost" style={{
      fontSize: '0.85rem',
      gap: '0.375rem',
    }}>
      {speaking ? '⏹️ Stop' : '🔊 Read Aloud'}
    </button>
  );
}
