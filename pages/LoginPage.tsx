import React, { useState } from 'react';
import type { Page, User } from '../types';
import { PawPrintIcon } from '../components/icons/PawPrintIcon';
import { getDbState } from '../lib/db';

interface LoginPageProps {
  navigate: (page: Page) => void;
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const db = getDbState();
      // Look in SQL Relational State
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (user) {
        onLogin(user);
      } else {
        setErrorMessage("Invalid credentials. Please attempt again or toggle Forgot Password.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    const db = getDbState();
    const user = db.users.find(u => u.email.toLowerCase() === forgotEmail.toLowerCase());
    
    if (user) {
      setForgotMessage(`✓ Recovery success: User located! Password for this profile is: "${user.password}" (Simulating secure recovery).`);
    } else {
      setForgotMessage(`✗ Error: Profile matching "${forgotEmail}" was not located in active SQL Database tables.`);
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-brand-orange-50 flex items-center justify-center min-h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <PawPrintIcon className="w-12 h-12 mx-auto text-brand-orange-400 mb-4" />
          
          {!isForgotPassword ? (
            <>
              <h1 className="text-3xl font-bold text-brand-teal-800 mb-6">Welcome Back!</h1>
              
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-left border border-red-200">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left justify-between flex">
                    <span>Email Address</span>
                    <span className="text-xs text-brand-teal-600">(Try: akul@example.com)</span>
                  </label>
                  <input type="email" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500"/>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">Password</label>
                    <button type="button" onClick={() => { setIsForgotPassword(true); setForgotMessage(''); }} className="text-xs font-semibold text-brand-teal-600 hover:text-brand-teal-800">
                      Forgot Password?
                    </button>
                  </div>
                  <input type="password" name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500"/>
                </div>
                <div>
                  <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-semibold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 transition-colors duration-300">
                    Login
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-brand-teal-800 mb-4">Reset Password</h1>
              <p className="text-gray-500 text-sm mb-6 text-left">
                Enter your registered email address below, and our relational diagnostics search engine will fetch your login credentials.
              </p>

              {forgotMessage && (
                <div className="mb-4 p-3 bg-brand-teal-50 text-brand-teal-800 rounded-lg text-sm text-left border border-brand-teal-200">
                  {forgotMessage}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-6">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 text-left">Email Address</label>
                  <input type="email" name="forgotEmail" id="forgotEmail" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500" placeholder="your@email.com"/>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsForgotPassword(false)} className="w-1/2 justify-center py-3 px-4 border border-gray-300 rounded-full shadow text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300">
                    &larr; Back to Login
                  </button>
                  <button type="submit" className="w-1/2 justify-center py-3 px-4 border border-transparent rounded-full shadow text-sm font-semibold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none transition-colors duration-300">
                    Search Credentials
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="mt-6 text-sm text-gray-600">
            Don't have an account?{' '}
            <button onClick={() => navigate('signup')} className="font-medium text-brand-teal-600 hover:text-brand-teal-500">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
