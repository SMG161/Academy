interface HeroProps {
  onEnrollNowClick: () => void;
}

const Hero = ({ onEnrollNowClick }: HeroProps) => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="relative">
            {/* Decorative yellow wavy line above */}
            <div className="absolute -top-8 left-0 w-24 h-2 bg-yellow-400 rounded-full opacity-60"></div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-600 font-normal">E-learning</span>{' '}
                <span className="text-blue-600">Education Platform</span>{' '}
                <span className="text-purple-600">in Your City</span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Learn from Experts. Grow Your Skills. Shape Your Future.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                Access high-quality courses, expert-led lectures, and practical resources designed to help you learn faster and smarter. Whether you're a student looking to build new skills or a professional aiming to advance your career, our platform connects you with experienced teachers and structured learning paths you can trust.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={onEnrollNowClick}
                  className="bg-purple-600 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-purple-700 transition-colors"
                >
                  Enroll Now
                </button>
                <button className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-md font-semibold text-lg hover:bg-purple-50 transition-colors">
                  Buy Course
                </button>
              </div>
            </div>
            
            {/* Decorative blue wavy line below */}
            <div className="absolute -bottom-8 left-0 w-32 h-2 bg-blue-400 rounded-full opacity-60"></div>
          </div>
          
          {/* Right Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="/landing page image.png" 
                alt="Student learning" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Decorative yellow blob background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full opacity-20 blur-3xl -z-10"></div>
            
            {/* Decorative purple dots pattern */}
            <div className="absolute bottom-8 right-8 grid grid-cols-4 gap-2 opacity-30">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-purple-600 rounded-full"></div>
              ))}
            </div>
            
            {/* Small yellow circle decoration */}
            <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-yellow-400 rounded-full opacity-40 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

