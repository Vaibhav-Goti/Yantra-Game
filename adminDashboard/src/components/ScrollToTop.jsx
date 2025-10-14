// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Small delay to ensure the page has rendered
        const timer = setTimeout(() => {
            // Scroll to top when route changes
            window.scrollTo({ 
                top: 0, 
                left: 0, 
                behavior: "smooth"
            });
        }, 100);

        // Cleanup timer on unmount or pathname change
        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
