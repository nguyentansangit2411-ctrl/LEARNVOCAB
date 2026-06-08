"use client";

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Determine initial theme
    const isLightMode = document.documentElement.classList.contains('light');
    setIsLight(isLightMode);
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove('light');
      localStorage.theme = 'dark';
      setIsLight(false);
    } else {
      document.documentElement.classList.add('light');
      localStorage.theme = 'light';
      setIsLight(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 bg-surface-2 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text flex items-center justify-center"
      title="Đổi giao diện Sáng/Tối"
    >
      {isLight ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
