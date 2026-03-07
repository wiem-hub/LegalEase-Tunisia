import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiMic, 
  FiLogOut, 
  FiFileText, 
  FiPieChart, 
  FiClock,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you will call the semantic search API
    console.log('Search:', query);
    // Redirect to results page or display results inline
  };

  const handleVoiceInput = () => {
    // Simulate voice recognition
    setIsListening(true);
    setTimeout(() => {
      setQuery("How to create a startup in Tunisia?");
      setIsListening(false);
    }, 2000);
  };

  // Frequent questions suggestions
  const frequentQuestions = [
    "What are the steps to create a startup?",
    "How to register with CNSS as an employer?",
    "What documents are needed for a startup?",
    "Employee declaration to CNSS",
    "Social obligations for startups"
  ];

  // Recent procedures (to be replaced with real data)
  const recentProcedures = [
    { id: 1, title: "Company creation", category: "Startup", date: "2026-02-20" },
    { id: 2, title: "CNSS employer registration", category: "CNSS", date: "2026-02-19" },
    { id: 3, title: "Quarterly declaration", category: "CNSS", date: "2026-02-18" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-primary-600">LegalEase Tunisia</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Hello, {user?.username}!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            How can I help you with your startup or CNSS procedures today?
          </p>
        </div>

        {/* Main search bar */}
        <div className="mb-16">
          <form onSubmit={handleSearch} className="flex flex-col items-center">
            <div className="w-full max-w-3xl relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-12 pr-24 py-4 text-lg border border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ask your question in French, English, or Tunisian dialect..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <FiMic className="h-6 w-6" />
                </button>
                <button
                  type="submit"
                  className="ml-2 px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: question suggestions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FiStar className="mr-2 text-yellow-400" />
                Frequent questions
              </h3>
              <ul className="mt-4 space-y-3">
                {frequentQuestions.map((q, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setQuery(q)}
                      className="text-left text-sm text-gray-600 hover:text-primary-600 hover:underline"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: recent procedures and stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent procedures card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FiClock className="mr-2 text-primary-500" />
                Recent procedures
              </h3>
              <div className="mt-4 divide-y divide-gray-200">
                {recentProcedures.map((proc) => (
                  <div key={proc.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{proc.title}</p>
                      <p className="text-xs text-gray-500">{proc.category} • {proc.date}</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats (for BI integration) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <FiFileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Procedures</p>
                    <p className="text-lg font-semibold text-gray-900">24</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <FiTrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">This week</p>
                    <p className="text-lg font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <FiPieChart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Categories</p>
                    <p className="text-lg font-semibold text-gray-900">3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;