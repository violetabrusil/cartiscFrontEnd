import { useState, useEffect } from 'react';

export function usePageSizeForTabletLandscape(defaultSize, landscapeSize) {
  const [pageSize, setPageSize] = useState(defaultSize);

  useEffect(() => {
    function updatePageSize() {
      if (window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches) {
        // Si la pantalla está en el rango de tamaño de una tablet en modo horizontal
        setPageSize(landscapeSize);
      } else {
        // Para cualquier otro tamaño
        setPageSize(defaultSize);
      }
    }

    window.addEventListener('resize', updatePageSize);
    updatePageSize(); // Establecer el tamaño de página inicial al montar

    return () => window.removeEventListener('resize', updatePageSize);
  }, [defaultSize, landscapeSize]);

  return pageSize;
}
