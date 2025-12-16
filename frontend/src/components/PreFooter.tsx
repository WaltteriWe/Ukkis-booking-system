import { animations } from "@/lib/constants";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";
import { useTheme } from "@/context/ThemeContext";


const PreFooter = () => {
    const { darkMode } = useTheme();
    const preFooterView = useInView({ threshold: 0.2, rootMargin: "-100px 0px" });

    return (
      <div 
        className="w-full overflow-hidden rounded-xl mt-20 mb-10 h-120 relative transition-all duration-700 ease-in-out"
        ref={preFooterView.ref as React.RefObject<HTMLDivElement>}
        style={
          preFooterView.isInView
            ? {
                ...animations.fadeInFloat(0),
                boxShadow: darkMode
                  ? "0 0 40px rgba(16, 185, 129, 0.15), 0 0 60px rgba(139, 92, 246, 0.1), inset 0 0 60px rgba(0, 255, 200, 0.05)"
                  : "none",
                background: darkMode
                  ? "linear-gradient(135deg, #1a1a2e 0%, #16243a 30%, #2d1a3a 60%, #2a3a4e 100%)"
                  : "transparent",
              }
            : { 
                opacity: 0, 
                transform: "translateY(20px)",
              }
        }
      >
        <Image 
          src="/images/hero-final.jpg" 
          alt="pre-footer-image"
          fill
          className="object-fill object-center brightness-90"
        />
      </div>
    );
};

export default PreFooter;
