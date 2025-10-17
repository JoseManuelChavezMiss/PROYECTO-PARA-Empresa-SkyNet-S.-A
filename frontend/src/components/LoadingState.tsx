import { Button } from 'primereact/button';

interface LoadingStateProps {
  message?: string;
  onRetry?: () => void;
}

export const LoadingState = ({ message = "Cargando asignaciones..." }: LoadingStateProps) => (
  <div className="flex justify-content-center align-items-center p-4">
    <i className="pi pi-spin pi-spinner mr-2"></i>
    <p>{message}</p>
  </div>
);

export const ErrorState = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
  <div className="p-4 border-round bg-red-50 text-red-700 flex justify-content-between align-items-center">
    <div>
      <i className="pi pi-exclamation-triangle mr-2"></i>
      <span>Error: {error}</span>
    </div>
    {onRetry && (
      <Button 
        icon="pi pi-refresh" 
        label="Reintentar" 
        onClick={onRetry}
        className="p-button-outlined p-button-sm"
      />
    )}
  </div>
);