import { useState, useEffect } from 'react';

export function usePageSizeForTabletLandscape(defaultSize, landscapeSize, portraitSize = defaultSize) {
  const [pageSize, setPageSize] = useState(defaultSize);

  useEffect(() => {
    function updatePageSize() {
      if (window.matchMedia("(min-width: 800px) and (max-width: 1340px) and (orientation: landscape)").matches) {
  
        setPageSize(landscapeSize);
      } else if (window.matchMedia("(max-width: 1024px) and (orientation: portrait)").matches) {

        setPageSize(portraitSize);
      } else {
        setPageSize(defaultSize);
      }
    }

    window.addEventListener('resize', updatePageSize);
    window.addEventListener('orientationchange', updatePageSize);
    updatePageSize();

    return () => {
      window.removeEventListener('resize', updatePageSize);
      window.removeEventListener('orientationchange', updatePageSize);
    };
  }, [defaultSize, landscapeSize, portraitSize]);

  return pageSize;
}
