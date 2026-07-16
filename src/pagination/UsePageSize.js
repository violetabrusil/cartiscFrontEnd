import { useState, useEffect } from 'react';

export function usePageSizeForTabletLandscape(defaultSize, landscapeSize, portraitSize = defaultSize) {
  const [pageSize, setPageSize] = useState(defaultSize);

  useEffect(() => {
    function updatePageSize() {
      if (window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches) {
        // Si la pantalla está en el rango de tamaño de una tablet en modo horizontal
        setPageSize(landscapeSize);
      } else if (window.matchMedia("(max-width: 1024px) and (orientation: portrait)").matches) {
        // Tablet en modo vertical: hay más alto disponible que en horizontal
        setPageSize(portraitSize);
      } else {
        // Para cualquier otro tamaño
        setPageSize(defaultSize);
      }
    }

    window.addEventListener('resize', updatePageSize);
    updatePageSize(); // Establecer el tamaño de página inicial al montar

    return () => window.removeEventListener('resize', updatePageSize);
  }, [defaultSize, landscapeSize, portraitSize]);

  return pageSize;
}
