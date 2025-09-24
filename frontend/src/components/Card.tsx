import Image from "next/image";
import Link from "next/link";

type CardProps = {
    title: string;
    description: string;
    imageSrc: string;
    badgeText?: string;
    badgeColor?: string;
    features?: string[];
    buttonText?: string;
    buttonColor?: string;
    buttonHref?: string;
};

const Card = ({title, imageSrc, description, badgeText, badgeColor = "bg-amber-400", features, buttonText, buttonColor = "bg-amber-400 hover:bg-amber-500", buttonHref = "#"}: CardProps) => {
  return (
    <div className="relative group cursor-pointer bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          width={400}
          height={300}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badgeText && (
          <div className="absolute top-4 left-4">
            <span className={`${badgeColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
              {badgeText}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          {description}
        </p>
        
        {features && (
          <div className="mb-6 space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </div>
            ))}
          </div>
        )}

        {buttonText && (
          <Link
            href={buttonHref}
            className={`${buttonColor} text-white font-medium px-6 py-3 rounded-full transition-colors block text-center`}
          >
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  )
}

export default Card;