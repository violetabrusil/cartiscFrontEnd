import { useState, useEffect } from 'react';

export const ELLIPSIS = '...';

export function getPageItems(currentPage, totalPages, maxSlots = 10) {
    const slots = Math.max(5, maxSlots);

    if (totalPages <= slots) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= slots - 3) {
        const head = Array.from({ length: slots - 2 }, (_, i) => i + 1);
        return [...head, ELLIPSIS, totalPages];
    }

    if (currentPage >= totalPages - slots + 4) {
        const tail = Array.from({ length: slots - 2 }, (_, i) => totalPages - (slots - 3) + i);
        return [1, ELLIPSIS, ...tail];
    }

    const middleSize = slots - 4;
    const start = currentPage - Math.floor((middleSize - 1) / 2);
    const middle = Array.from({ length: middleSize }, (_, i) => start + i);
    return [1, ELLIPSIS, ...middle, ELLIPSIS, totalPages];
}

export function useResponsiveMaxSlots(maxSlots = 10) {
    const compute = () => {
        if (typeof window === 'undefined') return maxSlots;
        const width = window.innerWidth;
        if (width <= 480) return Math.min(maxSlots, 5);
        if (width <= 768) return Math.min(maxSlots, 7);
        return maxSlots;
    };

    const [slots, setSlots] = useState(compute);

    useEffect(() => {
        const update = () => setSlots(compute());
        update();
        window.addEventListener('resize', update);
        window.addEventListener('orientationchange', update);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('orientationchange', update);
        };
    }, [maxSlots]);

    return slots;
}
