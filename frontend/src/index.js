import React, { useState, useEffect, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Your global CSS
import AuthProvider, { AuthContext } from './context/AuthContext'; // Import AuthProvider and AuthContext
import LoginPage from './LoginPage';     // Existing: Login Page
import RegisterPage from './RegisterPage'; // Existing: Register Page
import App from './App';                 // Your chat application (App.js)
import reportWebVitals from './reportWebVitals';

// Root component that manages the page view
function RootComponent() {
  const [currentPage, setCurrentPage] = useState('welcome'); // Start at 'welcome' page
  const { user } = useContext(AuthContext); // Get user from AuthContext

  // Effect to automatically switch to 'chat' if user is logged in
  useEffect(() => {
    if (user && user.username && currentPage !== 'chat') {
      setCurrentPage('chat'); // If user logs in, go to chat
    } else if (!user && currentPage === 'chat') {
      setCurrentPage('welcome'); // If user logs out from chat, go back to welcome
    }
  }, [user, currentPage]);

  // Render different components based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return (
          // Apply custom centering class here
          <div className="center-content-container" style={{ backgroundColor: '#FAF9F6' }}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center">
              <h1 className="text-4xl font-extrabold mb-6" style={{ color: '#722F37' }}>Welcome to RTalk</h1>
              <p className="text-lg font-bold text-gray-700 mb-8">Your real-time chat experience awaits!</p>
              <div className="space-y-4">
                <button
                  onClick={() => setCurrentPage('register')}
                  className="w-full py-3 px-6 rounded-lg text-white font-bold text-lg transition-colors duration-300 shadow-md"
                  style={{ backgroundColor: '#2196F3' }} // Dark Blue
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'} // Darker Blue on hover
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                >
                  Register
                </button>
                <button
                  onClick={() => setCurrentPage('login')}
                  className="w-full py-3 px-6 rounded-lg text-white font-bold text-lg transition-colors duration-300 shadow-md"
                  style={{ backgroundColor: '#4CAF50' }} // Green
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#388E3C'} // Darker Green on hover
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        );
      case 'login':
        return <LoginPage onLoginSuccess={() => setCurrentPage('chat')} onGoBack={() => setCurrentPage('welcome')} />;
      case 'register':
        return <RegisterPage onRegisterSuccess={() => setCurrentPage('chat')} onGoBack={() => setCurrentPage('welcome')} />;
      case 'chat':
        if (user && user.username) {
          return <App />;
        }
        // Fallback also needs the new centering class
        return (
          <div className="center-content-container" style={{ backgroundColor: '#F5F5DC' }}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center">
              <h1 className="text-4xl font-extrabold mb-6" style={{ color: '#722F37' }}>Welcome to RTalk</h1>
              <p className="text-lg font-bold text-gray-700 mb-8">Please login or register to continue.</p>
              <button
                  onClick={() => setCurrentPage('login')}
                  className="w-full py-3 px-6 rounded-lg text-white font-bold text-lg transition-colors duration-300 shadow-md"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#388E3C'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                >
                  Login
                </button>
            </div>
          </div>
        );
      default:
        return <div>Page Not Found</div>;
    }
  };

  // The RootComponent's direct return needs to be a full-screen container
  // to ensure the absolute positioning of its children works relative to it.
  return (
    <div className="min-h-screen h-screen relative"> {/* Make this relative for absolute children */}
      {renderPage()}
    </div>
  );
}

// Render the RootComponent wrapped in AuthProvider
const container = document.getElementById('root');
const root = createRoot(container);

// Render your application
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RootComponent />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();