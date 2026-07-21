import {useEffect} from 'react';
import {useLocation} from 'react-router';

declare global {
  interface Window {
    jdgm?: {
      loadWidgets?: () => void;
    };
  }
}

export function useJudgeMe() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tryInit = () => {
      const jdgm = (window as any).jdgm;
      if (jdgm?.AllReviewsPage?.initialize) {
        jdgm.AllReviewsPage.initialize();
        return true;
      }
      return false;
    };

    if (tryInit()) return;

    const id = setInterval(() => {
      if (tryInit()) clearInterval(id);
    }, 100);

    return () => clearInterval(id);
  }, []);
}
