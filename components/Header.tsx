import React, { useState } from 'react';
import type { Page, User } from '../types';
import { PawPrintIcon } from './icons/PawPrintIcon';

interface HeaderProps {
  currentPage: Page;
  navigate: (page: Page) => void;
  loggedInUser: User | null;
  onLogout: () => void;
}

const NavLink: React.FC<{
  page: Page;
  isActive: boolean;
  navigate: (page: Page) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ page, isActive, navigate, children, className }) => (
  <button
    onClick={() => navigate(page)}
    className={`px-4 py-2 rounded-md text-sm lg:text-base font-medium transition-colors duration-300 ${
      isActive
        ? 'text-brand-orange-600'
        : 'text-gray-600 hover:text-brand-orange-500'
    } ${className}`}
  >
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentPage, navigate, loggedInUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: { page: Page; label: string }[] = [
    { page: 'home', label: 'Home' },
    { page: 'services', label: 'Services' },
    { page: 'how-it-works', label: 'How It Works' },
    { page: 'community', label: 'Community' },
    { page: 'about', label: 'About Us' },
    { page: 'contact', label: 'Contact' },
  ];

  const authNavItems: { page: Page; label: string }[] = [
    { page: 'dashboard', label: 'Dashboard' },
    { page: 'profile', label: 'Profile' },
    { page: 'admin-analytics', label: 'Data Workspace 📊' },
  ];
  
  const serviceSubPages: Page[] = ['hosting', 'food', 'training', 'vets', 'events', 'playdates', 'adoption'];
  const isServiceSubPage = serviceSubPages.includes(currentPage);

  const renderNavLinks = (isMobile = false) => {
    const commonProps = {
        navigate: (page: Page) => {
            navigate(page);
            if (isMobile) setIsMenuOpen(false);
        },
        className: isMobile ? 'block w-full text-left' : ''
    };

    return (
        <>
            {navItems.map((item) => (
                <NavLink 
                    key={item.page} 
                    page={item.page} 
                    isActive={currentPage === item.page || (item.page === 'services' && isServiceSubPage)} 
                    {...commonProps}
                >
                    {item.label}
                </NavLink>
            ))}
            {loggedInUser && authNavItems.map((item) => (
                 <NavLink 
                    key={item.page} 
                    page={item.page} 
                    isActive={currentPage === item.page} 
                    {...commonProps}
                >
                    {item.label}
                </NavLink>
            ))}
        </>
    );
  }


  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <button onClick={() => navigate('home')} className="flex items-center space-x-2">
              <PawPrintIcon className="w-8 h-8 text-brand-orange-500" />
              <span className="text-2xl font-bold text-brand-teal-800">PetPal</span>
            </button>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {renderNavLinks()}
            </div>
          </div>
          <div className="hidden md:block">
            {loggedInUser ? (
                <button onClick={onLogout} className="bg-brand-teal-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-brand-teal-600 transition-transform duration-300 hover:scale-105">
                    Logout
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('login')} className="bg-white text-brand-orange-600 px-4 py-2 rounded-full font-semibold hover:bg-brand-orange-100 transition-colors duration-300">
                      Login
                    </button>
                    <button onClick={() => navigate('signup')} className="bg-brand-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-brand-orange-600 transition-transform duration-300 hover:scale-105">
                      Sign Up
                    </button>
                </div>
            )}
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-brand-orange-100 inline-flex items-center justify-center p-2 rounded-md text-brand-orange-600 hover:bg-brand-orange-200 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks(true)}
             <div className="mt-4 border-t border-gray-200 pt-4">
             {loggedInUser ? (
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full bg-brand-teal-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-brand-teal-600 transition-transform duration-300 hover:scale-105">
                    Logout
                </button>
            ) : (
                <div className="flex flex-col gap-2">
                    <button onClick={() => { navigate('login'); setIsMenuOpen(false); }} className="w-full bg-white text-brand-orange-600 px-4 py-2 rounded-full font-semibold hover:bg-brand-orange-100 transition-colors duration-300">
                      Login
                    </button>
                    <button onClick={() => { navigate('signup'); setIsMenuOpen(false); }} className="w-full bg-brand-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-brand-orange-600 transition-transform duration-300 hover:scale-105">
                      Sign Up
                    </button>
                </div>
            )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;