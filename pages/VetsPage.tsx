import React, { useEffect, useState, useRef } from 'react';
import type { Page } from '../types';
import { getDbState, saveDbState, calculateServiceCompatibility } from '../lib/db';

interface VetsPageProps {
  navigate: (page: Page) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
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

const VetsPage: React.FC<VetsPageProps> = ({ navigate }) => {
  const [db, setDb] = useState(getDbState());
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  // Booking states
  const [activeBookingVetId, setActiveBookingVetId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [symptoms, setSymptoms] = useState('');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card'>('UPI');
  const [cardNumber, setCardNumber] = useState('');

  // Filters
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    // Read user details from localStorage
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

  const baseVets = db.service_providers.filter(p => p.service_id === 3);

  const filteredVets = baseVets.filter(p => {
    if (cityFilter && p.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    return true;
  });

  const handleConfirmConsultation = (vetId: number, pricePerConsult: number) => {
    if (!loggedInUser) {
      alert("Please log in to schedule verified veterinary medical appointments.");
      navigate('login');
      return;
    }

    if (!selectedPetId) {
      alert("Please configure a pet profile first via your Owner Profile.");
      navigate('dashboard');
      return;
    }

    if (!bookingDate) {
      alert("Please specify a valid consultation calendar date.");
      return;
    }

    try {
      const activeDb = getDbState();
      const nextBookingId = activeDb.bookings.length + 1;

      // 1. Write booking row
      activeDb.bookings.push({
        id: nextBookingId,
        user_id: loggedInUser.id,
        pet_id: selectedPetId,
        provider_id: vetId,
        service_type: 'Veterinary Checkup',
        booking_date: `${bookingDate} ${bookingTime}`,
        status: 'confirmed',
        amount: pricePerConsult
      });

      // 2. Write payment row
      activeDb.payments.push({
        id: activeDb.payments.length + 1,
        booking_id: nextBookingId,
        amount: pricePerConsult,
        payment_method: paymentMode === 'UPI' ? 'UPI / QR Code' : 'Debit Card',
        status: 'success',
        payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      // 3. Update segment profiles
      const segmentRow = activeDb.user_segments.find(s => s.user_id === loggedInUser.id);
      if (segmentRow) {
        segmentRow.total_bookings += 1;
        segmentRow.total_spent += pricePerConsult;
        segmentRow.last_active = new Date().toISOString().substring(0, 10);
      }

      // 4. Update Notifications list
      activeDb.notifications.push({
        id: activeDb.notifications.length + 1,
        user_id: loggedInUser.id,
        message: `Clinic consult scheduled! 🩺 Dr. confirmed for ${bookingDate} at ${bookingTime}. Symptoms listed: ${symptoms || 'None'}.`,
        is_read: false,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      saveDbState(activeDb);

      alert(`🐾 Confirmed! Successfully booked veterinary consultation. Settle amount: ₹${pricePerConsult}`);
      setActiveBookingVetId(null);
      navigate('dashboard');

    } catch (err) {
      console.error("Vets program checkout failed:", err);
    }
  };

  return (
    <div className="py-12 bg-brand-orange-50/50 text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <BackButton onClick={() => navigate('services')} />

        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-brand-orange-100 text-brand-orange-850 text-xs font-bold rounded-full uppercase tracking-wider">
            Veterinary Care
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-teal-900 mt-2 font-sans tracking-tight">
            Consult Trusted Veterinarians Near You
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600">
            Compare medical caregivers, schedule general diagnostics checks, vaccinations, or emergency consults with ease.
          </p>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3 w-full md:w-auto">
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
          </div>

          {loggedInUser && userPets.length > 0 && (
            <div className="flex items-center gap-2 bg-brand-teal-50/70 p-2 rounded-xl border border-brand-teal-100/50">
              <span className="text-[11px] font-bold text-brand-teal-800">Clinic compatibility for:</span>
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

        {/* Relational Veterinarians listing */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredVets.map(vet => {
            const candidatePet = db.pets.find(p => p.id === selectedPetId);
            const compScore = candidatePet ? calculateServiceCompatibility(candidatePet, vet) : null;
            
            const isCheckingOut = activeBookingVetId === vet.id;

            return (
              <div key={vet.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-transform hover:-translate-y-0.5 duration-320">
                <div className="text-left">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold bg-brand-teal-100 text-brand-teal-800 px-2 py-0.5 rounded uppercase">
                      verified vet-doctor
                    </span>
                    {compScore != null && (
                    <div className="absolute top-3 right-3 bg-brand-teal-700 text-white ...">
                    ⚡{compScore.score}% Match
                       </div>
             )}
                  </div>
                  
                  <h3 className="text-lg font-black text-brand-teal-950 mt-3 leading-tight">{vet.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold font-mono mt-0.5">{vet.location}, {vet.city}</p>
                  
                  <div className="flex items-center gap-1.5 mt-2 border-b border-gray-100 pb-3">
                    <StarRating rating={vet.rating} />
                    <span className="text-xs text-gray-500 font-bold">({vet.rating}) Verified</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {vet.compatibility_tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-brand-orange-50 text-brand-orange-700 font-semibold px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sub-booking Drawer scheduling */}
                <div className="mt-4 border-t border-gray-100 pt-4 text-left">
                  {isCheckingOut ? (
                    <div className="space-y-3 bg-brand-orange-50/40 p-3.5 rounded-xl border border-brand-orange-100 text-xs">
                      <h4 className="font-extrabold text-brand-teal-950">Schedule Medical Appointment</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Select Date</label>
                          <input required type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-[110%] md:w-full bg-white border rounded p-1 text-xs" min={new Date().toISOString().substring(0, 10)}/>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Select Time</label>
                          <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full bg-white border rounded p-1 text-xs">
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:30 AM">11:30 AM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="04:30 PM">04:30 PM</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">List symptoms</label>
                        <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)} className="w-full bg-white border rounded p-1 text-xs" placeholder="E.g., lethargic, skin rash, vaccines due."/>
                      </div>

                      <div className="border-t border-gray-200 pt-2">
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Gateway payment method</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setPaymentMode('UPI')} className={`flex-1 py-1 rounded text-[10px] font-bold ${paymentMode === 'UPI' ? 'bg-brand-teal-700 text-white': 'bg-gray-200 text-gray-500'}`}>UPI</button>
                          <button type="button" onClick={() => setPaymentMode('Card')} className={`flex-1 py-1 rounded text-[10px] font-bold ${paymentMode === 'Card' ? 'bg-brand-teal-700 text-white': 'bg-gray-200 text-gray-500'}`}>Card</button>
                        </div>
                      </div>

                      <div className="text-right font-black text-brand-teal-900 border-t border-gray-200 pt-2">
                        Consultation Settle: ₹{vet.price_per_unit}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => setActiveBookingVetId(null)} className="flex-1 bg-gray-200 font-bold text-gray-700 py-1 rounded-full">✕ Back</button>
                        <button onClick={() => handleConfirmConsultation(vet.id, vet.price_per_unit)} className="flex-1 bg-brand-orange-500 font-bold text-white py-1 rounded-full shadow">Confirm book</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-base font-black text-brand-teal-850">
                        ₹{vet.price_per_unit.toLocaleString('en-IN')} <span className="font-normal text-xs text-gray-400">/ consult</span>
                      </p>
                      <button
                        onClick={() => setActiveBookingVetId(vet.id)}
                        className="bg-brand-orange-500 text-white font-extrabold text-xs py-2 px-5 rounded-full hover:bg-brand-orange-600 shadow transition-all hover:scale-104 select-none"
                      >
                        Book Appointment
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VetsPage;
