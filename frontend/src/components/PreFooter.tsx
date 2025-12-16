import { animations } from "@/lib/constants";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";


const PreFooter = () => {
    const preFooterView = useInView({ threshold: 0.2, rootMargin: "-100px 0px" });

    return <div className="w-full overflow-hidden rounded-xl mt-20 mb-10 h-120 relative transition-all duration-700 ease-in-out"
    ref={preFooterView.ref as React.RefObject<HTMLDivElement>}
            style={
              preFooterView.isInView
                ? animations.fadeInFloat(0)
                : { opacity: 0, transform: "translateY(20px)" }}>
        <Image 
        src="/images/hero-final.jpg" alt="pre-footer-image"
       fill
        className="object-fill object-center brightness-90 "
        />
    </div>;
};
export default PreFooter;
