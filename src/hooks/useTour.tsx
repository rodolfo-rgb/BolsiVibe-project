import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TourContextType {
  isFirstVisit: boolean;
  shouldStartTour: boolean;
  startTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = 'bolsivibe_tour_completed';

export function TourProvider({ children }: { children: ReactNode }) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [shouldStartTour, setShouldStartTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      setIsFirstVisit(true);
      // Pequeño delay para que los elementos estén renderizados
      setTimeout(() => {
        setShouldStartTour(true);
      }, 1000);
    }
  }, []);

  const startTour = () => {
    setShouldStartTour(true);
  };

  const completeTour = () => {
    setShouldStartTour(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsFirstVisit(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setIsFirstVisit(true);
    setShouldStartTour(true);
  };

  return (
    <TourContext.Provider value={{ isFirstVisit, shouldStartTour, startTour, completeTour, resetTour }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
