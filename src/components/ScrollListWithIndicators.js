import React, { useRef, useEffect, useState } from "react";
import Icon from "./Icons";

const ScrollListWithIndicators = ({ items, renderItem, children, style = {} }) => {
    const scrollRef = useRef(null);
    const [scrollState, setScrollState] = useState("none");
    const [hasOverflow, setHasOverflow] = useState(false);
    const [showIndicators, setShowIndicators] = useState(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const checkScroll = () => {
            const scrollTop = el.scrollTop;
            const totalHeight = el.scrollHeight;
            const visibleHeight = el.offsetHeight;

            const canScroll = totalHeight > visibleHeight;
            setHasOverflow(canScroll);

            setScrollState(() => {
                if (!canScroll) return "none";
                if (scrollTop <= 2) return "top";
                if (Math.ceil(scrollTop + visibleHeight) >= totalHeight - 2) return "bottom";
                return "middle";
            });

            setShowIndicators(true);
        };

        const raf = requestAnimationFrame(() => checkScroll());

        el.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);

        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [items, children]);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="scrollable-list-wrapper" style={style}>
            <div className="scrollable-list-container" ref={scrollRef}>
                <div className="panel-content">
                    {(Array.isArray(items) && renderItem)
                        ? items.map((item, index) => renderItem(item, index))
                        : children}
                </div>
            </div>

            {showIndicators && hasOverflow && scrollState === "top" && (
                <div className="scroll-indicator bottom" title="Bajar">
                    <Icon name="down" className="scroll-arrow-icon" />
                </div>
            )}

            {showIndicators && hasOverflow && scrollState === "bottom" && (
                <div className="scroll-indicator bottom" onClick={scrollToTop} title="Subir">
                    <Icon name="top" className="scroll-arrow-icon" />
                </div>
            )}


        </div>
    );
};



export default ScrollListWithIndicators;