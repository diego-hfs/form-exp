import { useEffect, useRef } from 'react';

/**
 * Hook de polling otimizado:
 * - Pausa automaticamente quando a aba do navegador fica oculta (não consome rede em background).
 * - Re-executa imediatamente ao voltar para a aba (dados sempre frescos quando o usuário olha).
 * - Permite desabilitar via `enabled` (ex.: pausar quando o usuário está num formulário).
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let intervalId: number | undefined;

    const start = () => {
      stop();
      intervalId = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          void callbackRef.current();
        }
      }, intervalMs);
    };

    const stop = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void callbackRef.current();
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs, enabled]);
}
