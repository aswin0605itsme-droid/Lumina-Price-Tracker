import { useState, useEffect } from 'react';
import { MAX_HISTORY_ITEMS } from '../constants';

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  const addSearch = (term: string) => {
    if (!term.trim()) return;
    
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      const newHistory = [term, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('search_history');
  };

  // Return empty array until mounted to prevent hydration mismatch in frameworks like Next.js
  return { history: isMounted ? history : [], addSearch, clearHistory };
};