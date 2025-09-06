// src/hooks/useToast.ts
import { useRef } from 'react';
import { Toast } from 'primereact/toast';
import type { ToastMessage } from 'primereact/toast';

export const useToast = () => {
    // Solo la lógica: la referencia al Toast
    const toast = useRef<Toast>(null);

    const showToast = (message: ToastMessage) => {
        toast.current?.show(message);
    };

    // El hook retorna la referencia y la función, no un componente.
    return { toast, showToast };
};