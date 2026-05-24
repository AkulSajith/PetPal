import React, { useState, useCallback, useEffect } from 'react';
import type { Page, User } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import CommunityPage from './pages/CommunityPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import HostingPage from './pages/HostingPage';
import FoodPage from './pages/FoodPage';
import TrainingPage from './pages/TrainingPage';
import VetsPage from './pages/VetsPage';
import EventsPage from './pages/EventsPage';
import PlaydatesPage from './pages/PlaydatesPage';
import AdoptionPage from './pages/AdoptionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import { initDatabase } from './lib/db';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    // Scaffold initial relational SQL state
    try {
      initDatabase();
    } catch (err) {
      console.error("Database scaffolding failed:", err);
    }

    // Check for a logged-in user on initial load
    try {
      const storedUser = localStorage.getItem('petpalLoggedInUser');
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
        setCurrentPage('dashboard');
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('petpalLoggedInUser');
    }
  }, []);

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = (user: User) => {
    const { password, ...userToStore } = user;
    setLoggedInUser(userToStore);
    localStorage.setItem('petpalLoggedInUser', JSON.stringify(userToStore));
    navigate('dashboard');
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('petpalLoggedInUser');
    navigate('home');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setLoggedInUser(updatedUser);
    localStorage.setItem('petpalLoggedInUser', JSON.stringify(updatedUser));
    
    const users: User[] = JSON.parse(localStorage.getItem("petpalUsers") || "[]");
    const userIndex = users.findIndex((u: User) => u.email === updatedUser.email);
    if (userIndex > -1) {
      // Keep existing password if not provided in update
      users[userIndex] = { ...users[userIndex], ...updatedUser };
      localStorage.setItem("petpalUsers", JSON.stringify(users));
    }
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'services':
        return <ServicesPage navigate={navigate} />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'community':
        return <CommunityPage />;
      case 'about':
        return <AboutUsPage />;
      case 'contact':
        return <ContactPage />;
      case 'hosting':
        return <HostingPage navigate={navigate} />;
      case 'food':
        return <FoodPage navigate={navigate} />;
      case 'training':
        return <TrainingPage navigate={navigate} />;
      case 'vets':
        return <VetsPage navigate={navigate} />;
      case 'events':
        return <EventsPage navigate={navigate} />;
      case 'playdates':
        return <PlaydatesPage navigate={navigate} />;
      case 'adoption':
        return <AdoptionPage navigate={navigate} />;
      case 'login':
        return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case 'signup':
        return <SignupPage navigate={navigate} />;
      case 'dashboard':
        return loggedInUser ? <DashboardPage user={loggedInUser} navigate={navigate} /> : <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case 'profile':
        return loggedInUser ? <ProfilePage user={loggedInUser} onUpdateUser={handleUserUpdate} /> : <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case 'admin-analytics':
         return <AdminAnalyticsPage />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-orange-50 text-gray-800 font-sans">
      <Header currentPage={currentPage} navigate={navigate} loggedInUser={loggedInUser} onLogout={handleLogout} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
