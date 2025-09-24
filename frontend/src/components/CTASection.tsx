import Link from "next/link";

const CTASection = () => {
  return (
    <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready for Your Arctic Adventure?
        </h2>
        <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
          Join thousands of adventurers who have experienced the magic of Lapland with 
          Ukkis Safaris. Book your unforgettable Arctic expedition today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/bookings"
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-full text-lg transition-colors"
          >
            Book Your Adventure
          </Link>
          <Link
            href="/categories"
            className="border-2 border-white text-white hover:bg-white hover:text-purple-900 font-bold px-8 py-4 rounded-full text-lg transition-colors"
          >
            View All Tours
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTASection;