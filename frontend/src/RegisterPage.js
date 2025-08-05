import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';

function RegisterPage({ onRegisterSuccess, onGoBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (username.trim()) {
      login(username.trim());
      onRegisterSuccess();
    }
  };

  return (
    // Apply custom centering class here
    <div className="center-content-container" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center mb-6" style={{ color: '#722F37' }}>Register for RTalk</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#722F37', borderColor: '#D1D5DB' }}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#722F37', borderColor: '#D1D5DB' }}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#722F37', borderColor: '#D1D5DB' }}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-lg text-white font-bold text-lg transition-colors duration-300 shadow-md"
              style={{ backgroundColor: '#2196F3' }} // Dark Blue
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'} // Darker Blue on hover
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
            >
              Register
            </button>
          </div>
        </form>
        <button
          onClick={onGoBack}
          className="mt-6 w-full py-2 px-4 rounded-lg text-gray-700 font-bold transition-colors duration-200 hover:bg-gray-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;