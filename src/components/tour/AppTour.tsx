import { TourProvider as ReactTourProvider, useTour as useReactTour } from '@reactour/tour';
import { tourSteps } from './TourSteps';
import { useTour } from '../../hooks/useTour';
import { ReactNode, useEffect } from 'react';
import { Button } from '../ui/button';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface TourContentProps {
  content: ReactNode;
  currentStep: number;
  totalSteps: number;
  setCurrentStep: (step: number) => void;
  setIsOpen: (open: boolean) => void;
}

function TourContent({ content, currentStep, totalSteps, setCurrentStep, setIsOpen }: TourContentProps) {
  const { completeTour } = useTour();
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleClose = () => {
    completeTour();
    setIsOpen(false);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="p-4 max-w-sm">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Cerrar tour"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="mb-4">
        {content}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t">
        <span className="text-sm text-muted-foreground">
          {currentStep + 1} de {totalSteps}
        </span>
        
        <div className="flex gap-2">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={handleNext}
            className="gap-1"
          >
            {isLastStep ? (
              <>
                Finalizar
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TourController() {
  const { shouldStartTour } = useTour();
  const { setIsOpen } = useReactTour();

  useEffect(() => {
    if (shouldStartTour) {
      setIsOpen(true);
    }
  }, [shouldStartTour, setIsOpen]);

  return null;
}

interface AppTourProps {
  children: ReactNode;
}

export default function AppTour({ children }: AppTourProps) {
  return (
    <ReactTourProvider
      steps={tourSteps}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: '12px',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border)',
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        maskWrapper: (base) => ({
          ...base,
          color: 'rgba(0, 0, 0, 0.5)',
        }),
        highlightedArea: (base) => ({
          ...base,
          display: 'block',
          stroke: 'hsl(212, 69%, 50%)',
          strokeWidth: 2,
          rx: 8,
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: 'hsl(212, 69%, 50%)',
        }),
        controls: (base) => ({
          ...base,
          display: 'none',
        }),
        close: (base) => ({
          ...base,
          display: 'none',
        }),
      }}
      padding={{
        mask: 8,
        popover: [8, 12],
        wrapper: 0,
      }}
      ContentComponent={(props) => (
        <TourContent
          content={props.content}
          currentStep={props.currentStep}
          totalSteps={props.steps.length}
          setCurrentStep={props.setCurrentStep}
          setIsOpen={props.setIsOpen}
        />
      )}
      onClickMask={() => {}} // Prevenir cerrar al hacer clic en la máscara
    >
      <TourController />
      {children}
    </ReactTourProvider>
  );
}
