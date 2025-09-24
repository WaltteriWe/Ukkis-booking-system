import { Shield, Star, Wrench } from "lucide-react";

const SafetySection = () => {
  const features = [
    {
      icon: Star,
      title: "Certified Guides",
      description: "All guides are certified professionals with extensive Arctic experience",
      color: "bg-amber-400"
    },
    {
      icon: Wrench,
      title: "Premium Equipment", 
      description: "Top-quality vehicles and safety gear maintained to the highest standards",
      color: "bg-purple-600"
    },
    {
      icon: Shield,
      title: "Emergency Prepared",
      description: "Comprehensive emergency protocols and wilderness first aid training",
      color: "bg-blue-400"
    }
  ];

  return (
    <div className="bg-gray-100 py-16 my-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Safety & Professionalism First
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Your safety is our top priority. Every adventure begins with comprehensive 
              safety briefings and equipment checks. Our certified guides have years of 
              Arctic experience and are trained in wilderness first aid.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`${feature.color} p-3 rounded-full`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-200 to-blue-400 rounded-3xl h-96 flex items-center justify-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl w-48 h-32 transform rotate-12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetySection;