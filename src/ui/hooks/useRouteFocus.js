import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Gestión de foco en cambios de ruta cliente (SPA): sin esto, React Router
 * solo cambia el DOM y el foco se queda flotando en el enlace pulsado, así
 * que un lector de pantalla nunca anuncia que "cambió de página". Tras cada
 * cambio de ruta, mueve el foco al `<h1>` de la vista destino (cada vista
 * le pone `tabIndex={-1}` para que sea programáticamente enfocable sin
 * entrar en el orden de tabulación).
 *
 * No se dispara en el montaje inicial: el documento servido por SSR ya
 * llega completo y el navegador gestiona el foco inicial de forma natural;
 * solo las navegaciones posteriores (sin recarga de página) necesitan este
 * anuncio manual.
 */
export function useRouteFocus() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.querySelector('main h1')?.focus();
  }, [pathname]);
}
