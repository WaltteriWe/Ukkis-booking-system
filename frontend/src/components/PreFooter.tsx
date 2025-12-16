import Image from "next/image";

const PreFooter = () => {
    return <div className="w-full overflow-hidden rounded-xl mt-20 mb-10 h-120 relative">
        <Image 
        src="/images/hero-final.jpg" alt="pre-footer-image"
       fill
        className="object-fill object-center brightness-90 "
        />
    </div>;
};
export default PreFooter;
