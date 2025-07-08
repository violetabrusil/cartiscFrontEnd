import React, { useRef, useEffect, useState } from "react";
import Icon from "./Icons";

const ScrollListWithIndicators = ({ items, renderItem, children, style = {} }) => {
    const scrollRef = useRef(null);
    const [scrollState, setScrollState] = useState("none"); // "top", "middle", "bottom", "none"
    const [hasOverflow, setHasOverflow] = useState(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const checkScroll = () => {
            const scrollTop = el.scrollTop;
            const totalHeight = el.scrollHeight;
            const visibleHeight = el.offsetHeight; // <- alternativa a clientHeight

            const canScroll = totalHeight > visibleHeight;
            setHasOverflow(canScroll);

            setScrollState(prev => {
                if (!canScroll && prev !== "none") return "none";
                if (scrollTop === 0 && prev !== "top") return "top";
                if (Math.ceil(scrollTop + visibleHeight) >= totalHeight && prev !== "bottom")
                    return "bottom";
                if (prev !== "middle") return "middle";
                return prev;
            });
        };

        checkScroll();
        el.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);

        return () => {
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

            {/* Botones ABSOLUTOS, fuera del scroll */}
            {hasOverflow && scrollState === "top" && (
                <div className="scroll-indicator bottom">
                    <Icon name="down" className="scroll-arrow-icon" />
                </div>
            )}

            {hasOverflow && scrollState === "bottom" && (
                <div className="scroll-indicator top" onClick={scrollToTop}>
                    <Icon name="top" className="scroll-arrow-icon" />
                </div>
            )}
        </div>

    );
};


export default ScrollListWithIndicators;