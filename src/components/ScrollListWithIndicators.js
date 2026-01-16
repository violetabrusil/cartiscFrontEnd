import React, { useRef, useEffect, useState } from "react";
import Icon from "./Icons";

const ScrollListWithIndicators = ({ items, renderItem, children, style = {} }) => {
    const scrollRef = useRef(null);
    const [scrollState, setScrollState] = useState("top");
    const [hasOverflow, setHasOverflow] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        const canScroll = scrollHeight > clientHeight + 2;
        console.log("¿Tiene scroll?:", canScroll);
        setHasOverflow(canScroll);

        const isAtTop = scrollTop <= 5;
        const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 5;

        if (isAtTop) {
            setScrollState("top");
        } else if (isAtBottom) {
            setScrollState("bottom");
        } else {
            setScrollState("middle");
        }
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);

        const observer = new MutationObserver(checkScroll);
        observer.observe(el, { childList: true, subtree: true });

        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
            observer.disconnect();
        };
    }, [items, children]);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
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

            {hasOverflow && (
                <div
                    className={`scroll-indicator bottom visible ${scrollState === "bottom" ? "is-up" : "is-down"}`}
                    onClick={scrollState === "bottom" ? scrollToTop : scrollToBottom}
                    title={scrollState === "bottom" ? "Subir" : "Bajar"}
                >
                    {scrollState === "bottom" ? (
                        <Icon name="top" className="scroll-arrow-icon" />
                    ) : (
                        <Icon name="down" className="scroll-arrow-icon" />
                    )}
                </div>
            )}

        </div>
    );
};

export default ScrollListWithIndicators;