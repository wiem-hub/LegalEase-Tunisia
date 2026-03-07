import { Link } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiSearch, 
  FiMessageSquare, 
  FiShield, 
  FiGlobe, 
  FiBookOpen,
  FiGithub,
  FiTwitter,
  FiLinkedin
} from 'react-icons/fi';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left column: text */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Your assistant for</span>
                  <span className="block text-primary-600">startup & CNSS procedures</span>
                </h1>
                <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0">
                  Ask your questions in French, English, or Tunisian dialect. Get simplified answers instantly.
                </p>
                {/* Buttons horizontal */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started
                    <FiArrowRight className="ml-2" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
              {/* Right column: image */}
              <div className="hidden lg:block">
                <img
                  src="/bureau.jpg" // Remplacez par le chemin de votre image
                  alt="Modern office workspace"
                  className="rounded-lg shadow-2xl w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                Three simple steps to get the information you need
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto">
                  <FiMessageSquare className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Ask your question</h3>
                <p className="mt-2 text-gray-500">
                  Type or speak your question in any language.
                </p>
              </div>
              {/* Step 2 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto">
                  <FiSearch className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Semantic search</h3>
                <p className="mt-2 text-gray-500">
                  Our AI finds the most relevant procedures.
                </p>
              </div>
              {/* Step 3 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto">
                  <FiBookOpen className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Simplified answers</h3>
                <p className="mt-2 text-gray-500">
                  Get clear, step-by-step explanations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why choose us?
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                We make legal procedures accessible to everyone
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-5">
                  <FiGlobe className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Multilingual support</h3>
                <p className="mt-2 text-gray-500">
                  French, English, and Tunisian dialect.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-5">
                  <FiShield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Reliable sources</h3>
                <p className="mt-2 text-gray-500">
                  Based on official documents and guides.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-5">
                  <FiArrowRight className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Step-by-step guidance</h3>
                <p className="mt-2 text-gray-500">
                  Clear procedures for startup creation and CNSS.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">LegalEase Tunisia</h3>
              <p className="text-gray-400 text-sm">
                Simplifying startup and CNSS procedures through AI.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-white transition">Sign Up</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FiTwitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FiLinkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FiGithub className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} LegalEase Tunisia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;