import { useEffect, useRef } from "react";

const scrollPositions = new Map();
let activeModule = null;

function moduleOf(key) {
    const separatorIndex = key.indexOf(':');
    return separatorIndex === -1 ? key : key.slice(0, separatorIndex);
}

export function enteringModule(moduleName) {
    if (activeModule === moduleName) return false;

    if (activeModule) {
        for (const key of Array.from(scrollPositions.keys())) {
            if (moduleOf(key) === activeModule) {
                scrollPositions.delete(key);
            }
        }
    }

    activeModule = moduleName;
    return true;
}

export function useScrollRestoration(key, ready) {
    const containerRef = useRef(null);
    const moduleName = moduleOf(key);

    useEffect(() => {
        if (!ready || !containerRef.current) return;

        const isFreshModule = enteringModule(moduleName);
        const saved = isFreshModule ? undefined : scrollPositions.get(key);
        containerRef.current.scrollTop = saved || 0;
    }, [key, ready, moduleName]);

    useEffect(() => {
        const node = containerRef.current;
        if (!ready || !node) return;

        const handleScroll = () => scrollPositions.set(key, node.scrollTop);
        node.addEventListener('scroll', handleScroll);
        return () => node.removeEventListener('scroll', handleScroll);
    }, [key, ready]);

    return containerRef;
}
