import Image from "next/image";

type CardProps = {
    title: string;
    description: string;
    imageSrc: string;
    badgeText?: string;
    badgeColor?: string;
};

const Card = ({title, imageSrc, description, badgeText, badgeColor = "bg-amber-400"}: CardProps) => {
  return (
    <>
    <div className="relative group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          alt={title}
          width={400}
          height={300}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        {badgeText && (
            <div className="absolute top-4 left-4">
            <span className={` ${badgeColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
              {badgeText}
            </span>
          </div>
        )}
      </div>
      <div className="mt-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
        </>
  )
}

export default Card;