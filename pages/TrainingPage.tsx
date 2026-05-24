import React, { useState, useEffect } from 'react';
import type { Page } from '../types';
import { getDbState, saveDbState, calculateServiceCompatibility } from '../lib/db';

interface TrainingPageProps {
  navigate: (page: Page) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
    ))}
  </div>
);

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="inline-flex items-center gap-2 text-brand-teal-700 hover:text-brand-teal-900 transition-colors mb-8 text-sm font-semibold">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
    Back to Services Marketplace
  </button>
);

const TrainingPage: React.FC<TrainingPageProps> = ({ navigate }) => {
  const [db, setDb] = useState(getDbState());
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  // Booking states
  const [activeBookingTrainerId, setActiveBookingTrainerId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [numberOfSessions, setNumberOfSessions] = useState(1);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card'>('UPI');
  const [upiAddress] = useState('paytrainpal@ybl');
  const [cardNumber, setCardNumber] = useState('');

  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  useEffect(() => {
    // Check credentials
    const storedUser = localStorage.getItem('petpalLoggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const userRow = db.users.find(u => u.email.toLowerCase() === parsedUser.email.toLowerCase());
      if (userRow) {
        setLoggedInUser(userRow);
        const pets = db.pets.filter(p => p.owner_id === userRow.id);
        setUserPets(pets);
        if (pets.length > 0) {
          setSelectedPetId(pets[0].id);
        }
      }
    }
  }, []);

  // Fetch Trainer caregivers (service_id = 2 is Training)
  const baseTrainers = db.service_providers.filter(p => p.service_id === 2);

  const filteredTrainers = baseTrainers.filter(p => {
    if (cityFilter && p.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (tagFilter && !p.compatibility_tags.some((tag: string) => tag.toLowerCase().includes(tagFilter.toLowerCase()))) return false;
    return true;
  });

  const handleConfirmBooking = (trainerId: number, pricePerSession: number) => {
    if (!loggedInUser) {
      alert("Please log in or sign up to schedule certified pet training.");
      navigate('login');
      return;
    }

    if (!selectedPetId) {
      alert("Please add a pet profile via your Owner Profile first.");
      navigate('dashboard');
      return;
    }

    if (!bookingDate) {
      alert("Please specify a valid calendar path date.");
      return;
    }

    const totalBill = pricePerSession * numberOfSessions;

    try {
      const activeDb = getDbState();
      const nextBookingId = activeDb.bookings.length + 1;

      // 1. Insert booking row
      activeDb.bookings.push({
        id: nextBookingId,
        user_id: loggedInUser.id,
        pet_id: selectedPetId,
        provider_id: trainerId,
        service_type: 'Certified Training',
        booking_date: bookingDate,
        status: 'confirmed',
        amount: totalBill
      });

      // 2. Insert payment row
      activeDb.payments.push({
        id: activeDb.payments.length + 1,
        booking_id: nextBookingId,
        amount: totalBill,
        payment_method: paymentMode === 'UPI' ? 'UPI / QR Code' : 'Debit Card',
        status: 'success',
        payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      // 3. Update segment profiles
      const segmentRow = activeDb.user_segments.find(s => s.user_id === loggedInUser.id);
      if (segmentRow) {
        segmentRow.total_bookings += 1;
        segmentRow.total_spent += totalBill;
        segmentRow.last_active = new Date().toISOString().substring(0, 10);
      }

      // 4. Update in-app alerts / notifications
      activeDb.notifications.push({
        id: activeDb.notifications.length + 1,
        user_id: loggedInUser.id,
        message: `Training Scheduled! 🐕 Sitter confirmed for on-site coaching starting ${bookingDate} (${numberOfSessions} Lessons).`,
        is_read: false,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      saveDbState(activeDb);

      alert(`🐾 Confirmed! Successfully registered training lessons program. Total Settle: ₹${totalBill.toLocaleString('en-IN')}`);
      setActiveBookingTrainerId(null);
      navigate('dashboard');

    } catch (err) {
      console.error("Training program checkout failed:", err);
    }
  };

  return (
    <div className="py-12 bg-brand-orange-50/50 text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <BackButton onClick={() => navigate('services')} />

        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-brand-orange-100 text-brand-orange-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Behavioral Training
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-teal-900 mt-2 font-sans tracking-tight">
            Certified Trainers & Walkers
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600">
            Connect with skilled experts who will help structure fitness training, puppy socializations, and advanced obedience courses.
          </p>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase">Filters:</span>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs bg-white focus:outline-none"
            >
              <option value="">All Cities</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Pune">Pune</option>
            </select>

            <select
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs bg-white focus:outline-none"
            >
              <option value="">All Specialities</option>
              <option value="Obedience">Obedience</option>
              <option value="Puppy Training">Puppy Training</option>
              <option value="Agility">Agility</option>
              <option value="Puppy Socialization">Puppy Socialization</option>
            </select>
          </div>

          {loggedInUser && userPets.length > 0 && (
            <div className="flex items-center gap-2 bg-brand-teal-50/70 p-2 rounded-xl border border-brand-teal-100/50">
              <span className="text-[11px] font-bold text-brand-teal-800">Scoring profile for:</span>
              <select
                value={selectedPetId || ''}
                onChange={e => setSelectedPetId(Number(e.target.value))}
                className="bg-white text-xs border border-brand-teal-200/50 rounded py-0.5 px-2 text-brand-teal-900 font-bold"
              >
                {userPets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Dynamic Trainer List grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map(trainer => {
              const candidatePet = db.pets.find(p => p.id === selectedPetId);
              const compScore = candidatePet ? calculateServiceCompatibility(candidatePet, trainer) : null;
              
              const isCheckingOut = activeBookingTrainerId === trainer.id;

              return (
                <div key={trainer.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-0.5">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <img className="w-28 h-28 rounded-full object-cover shadow-md border-2 border-brand-orange-100" src={trainer.image_url || 'https://picsum.photos/seed/sitter/300/300'} alt={trainer.name} />
                      {compScore != null && (
                      <div className="absolute top-3 right-3 bg-brand-teal-700 text-white ...">
                    ⚡ {compScore.score}% Match
                      </div>
                )}
                    </div>

                    <h3 className="text-xl font-extrabold text-brand-teal-950 mt-4">{trainer.name}</h3>
                    <p className="text-xs text-gray-400 font-mono font-bold mt-0.5">{trainer.location}, {trainer.city}</p>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <StarRating rating={trainer.rating} />
                      <span className="text-xs text-gray-500 font-semibold">{trainer.rating} / 5</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-center my-4">
                      {trainer.compatibility_tags.map((tag: string) => (
                        <span key={tag} className="bg-brand-teal-50 text-brand-teal-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Checkout Area controls */}
                  <div className="mt-4 border-t border-gray-100 pt-4 text-left">
                    {isCheckingOut ? (
                      <div className="space-y-3 bg-brand-orange-50/40 p-3.5 rounded-xl border border-brand-orange-100 text-xs">
                        <h4 className="font-extrabold text-brand-teal-950">Configure Lessons Calendar</h4>
                        
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block">Start Date & Time</label>
                          <input required type="datetime-local" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full bg-white border rounded p-1 text-xs"/>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block">Number of Coaching Sessions</label>
                          <select value={numberOfSessions} onChange={e => setNumberOfSessions(Number(e.target.value))} className="w-full bg-white border rounded p-1 text-xs">
                            <option value="1">1 Lesson (Puppy socialization)</option>
                            <option value="3">3 Lessons (Basic Obedience)</option>
                            <option value="5">5 Lessons (Advanced Agility Master)</option>
                          </select>
                        </div>

                        <div className="border-t border-gray-200 pt-2 text-[#0D2C24]">
                          <span className="text-xs block font-bold text-gray-400 uppercase">Gateway payment</span>
                          <div className="flex gap-2 mt-1">
                            <button type="button" onClick={() => setPaymentMode('UPI')} className={`flex-1 py-1 rounded text-[10px] font-bold ${paymentMode === 'UPI' ? 'bg-brand-teal-700 text-white': 'bg-gray-200 text-gray-500'}`}>UPI QR</button>
                            <button type="button" onClick={() => setPaymentMode('Card')} className={`flex-1 py-1 rounded text-[10px] font-bold ${paymentMode === 'Card' ? 'bg-brand-teal-700 text-white': 'bg-gray-200 text-gray-500'}`}>Debit/Credit</button>
                          </div>
                        </div>

                        <div className="text-right font-black text-brand-teal-900 border-t border-gray-200 pt-2">
                          Program Bill: ₹{(trainer.price_per_unit * numberOfSessions).toLocaleString('en-IN')}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => setActiveBookingTrainerId(null)} className="flex-1 bg-gray-200 font-bold text-gray-700 py-1 rounded-full">✕ Back</button>
                          <button onClick={() => handleConfirmBooking(trainer.id, trainer.price_per_unit)} className="flex-1 bg-brand-orange-500 font-bold text-white py-1 rounded-full shadow">Confirm Pay</button>
                        </div>

                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-black text-brand-teal-850">
                          ₹{trainer.price_per_unit.toLocaleString('en-IN')} <span className="font-normal text-xs text-gray-400">/ session</span>
                        </p>
                        <button
                          onClick={() => setActiveBookingTrainerId(trainer.id)}
                          className="bg-brand-orange-500 text-white font-extrabold text-xs py-2 px-5 rounded-full hover:bg-brand-orange-600 shadow transition-all hover:scale-104 select-none"
                        >
                          Book Trainer
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-20 bg-white rounded-3xl border border-gray-150 text-gray-450 text-sm font-semibold">
              No matching trainers found. Please clear the filtering tags and try again.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TrainingPage;
