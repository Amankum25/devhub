import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - DevHub` : 'DevHub - AI-Powered Developer Platform';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default usePageTitle;
