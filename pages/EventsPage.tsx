import React, { useState, useEffect } from 'react';
import type { Page, CommunityEvent } from '../types';
import { COMMUNITY_EVENTS } from '../constants';
import { getDbState, saveDbState } from '../lib/db';

interface EventsPageProps {
  navigate: (page: Page) => void;
}

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="inline-flex items-center gap-2 text-brand-teal-700 hover:text-brand-teal-900 transition-colors mb-8 text-sm font-semibold">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
    Back to Services Marketplace
  </button>
);

const EventsPage: React.FC<EventsPageProps> = ({ navigate }) => {
  const [db, setDb] = useState(getDbState());
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<number[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('petpalLoggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const userRow = db.users.find(u => u.email.toLowerCase() === parsedUser.email.toLowerCase());
      if (userRow) {
        setLoggedInUser(userRow);
      }
    }
  }, []);

  const handleRegisterEvent = (event: CommunityEvent) => {
    if (!loggedInUser) {
      alert("Please log in or sign up first to secure community slots.");
      navigate('login');
      return;
    }

    if (registeredEventIds.includes(event.id)) {
      alert("You are already successfully registered for this event.");
      return;
    }

    try {
      const activeDb = getDbState();
      
      // 1. Write custom reservation alert to notifications table
      const ticketId = Math.floor(100000 + Math.random() * 900000);
      activeDb.notifications.push({
        id: activeDb.notifications.length + 1,
        user_id: loggedInUser.id,
        message: `Event Entry Pass: Successfully registered for "${event.title}" on ${event.date} at ${event.location}. Ticket Code: #PASS-${ticketId}. See you there! 🐾`,
        is_read: false,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      // 2. Commit transaction
      saveDbState(activeDb);
      setRegisteredEventIds(prev => [...prev, event.id]);

      alert(`🐾 Confirmed! Registered successfully. Generated Gate Pass: #PASS-${ticketId}. Code saved in your notification logs.`);
    } catch (err) {
      console.error("Event registration failed:", err);
    }
  };

  return (
    <div className="py-12 bg-brand-orange-50/50 text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <BackButton onClick={() => navigate('services')} />
        
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-brand-orange-100 text-brand-orange-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Community Meetups
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0D2C24] mt-2 font-sans tracking-tight">
            Pawsitive Experiences & Festivals
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600">
            Connect with local pet lovers, register for weekend social runs, behavior talks, and interactive carnivals in your area.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMMUNITY_EVENTS.map(event => {
            const isRegistered = registeredEventIds.includes(event.id);
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col justify-between">
                <div>
                  <img className="w-full h-56 object-cover" src={event.imageUrl} alt={event.title} />
                  <div className="p-6 text-left">
                    <h3 className="text-xl font-bold text-brand-teal-950">{event.title}</h3>
                    <p className="text-xs text-brand-orange-600 font-bold uppercase tracking-wider font-mono mt-1.5">{event.date}</p>
                    <p className="text-xs text-gray-400 font-semibold font-mono mt-0.5">{event.location}</p>
                    <p className="text-gray-600 text-xs leading-relaxed mt-4">{event.description}</p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleRegisterEvent(event)}
                    className={`w-full font-extrabold text-xs py-2.5 rounded-full shadow transition-all duration-300 ${
                      isRegistered 
                        ? 'bg-brand-teal-500 text-white hover:bg-brand-teal-600' 
                        : 'bg-brand-orange-500 text-[#0D2C24] hover:bg-brand-orange-600 hover:scale-102 hover:shadow-md'
                    }`}
                  >
                    {isRegistered ? '✓ Secure Pass Confirmed' : 'Register & Secure Gate Pass'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
