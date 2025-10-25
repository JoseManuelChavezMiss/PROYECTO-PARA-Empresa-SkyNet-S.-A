// src/hooks/useToast.ts
import { useRef } from 'react';
import { Toast } from 'primereact/toast';
import type { ToastMessage } from 'primereact/toast';

export const useToast = () => {
    
    const toast = useRef<Toast>(null);

    const showToast = (message: ToastMessage) => {
        toast.current?.show(message);
    };

    // El hook retorna la referencia y la función
    return { toast, showToast };
};