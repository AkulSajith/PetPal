import React, { useState, useEffect } from 'react';
import type { Page } from '../types';
import { getDbState, saveDbState, calculateServiceCompatibility } from '../lib/db';

interface HostingPageProps {
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

const BackButton: React.FC<{onClick: () => void}> = ({onClick}) => (
  <button onClick={onClick} className="inline-flex items-center gap-2 text-brand-teal-700 hover:text-brand-teal-900 transition-colors mb-8 text-sm font-semibold">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
    Back to Services Marketplace
  </button>
);

const HostingPage: React.FC<HostingPageProps> = ({ navigate }) => {
  const [db, setDb] = useState(getDbState());
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  // Booking states
  const [activeBookingProviderId, setActiveBookingProviderId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specialInstruct, setSpecialInstruct] = useState('');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card'>('UPI');
  const [upiAddress, setUpiAddress] = useState('paypetpal@ybl');
  const [cardNumber, setCardNumber] = useState('');

  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [priceSort, setPriceSort] = useState<'All' | 'LowToHigh' | 'HighToLow'>('All');

  useEffect(() => {
    // Determine active login state
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

  // Filter caregivers (serviceId = 1 is Boarding)
  const baseCaregivers = db.service_providers.filter(p => p.service_id === 1);
  
  const filteredCaregivers = baseCaregivers.filter(p => {
    if (cityFilter && p.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    return true;
  }).sort((a, b) => {
    if (priceSort === 'LowToHigh') return a.price_per_unit - b.price_per_unit;
    if (priceSort === 'HighToLow') return b.price_per_unit - a.price_per_unit;
    return 0;
  });

  // Calculate days for booking
  const calculateTotalBill = (pricePerDay: number) => {
    if (!startDate || !endDate) return pricePerDay;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffMs = e.getTime() - s.getTime();
    if (diffMs <= 0) return pricePerDay;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days * pricePerDay;
  };

  const calculateDaysCount = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffMs = e.getTime() - s.getTime();
    if (diffMs <= 0) return 1;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Process SQL transaction
  const handleConfirmBooking = (providerId: number, pricePerDay: number) => {
    if (!loggedInUser) {
      alert("Please log in or create an account to book boarding services.");
      navigate('login');
      return;
    }

    if (!selectedPetId) {
      alert("Please add/register a pet first via your Owner Profile or Dashboard before booking.");
      navigate('dashboard');
      return;
    }

    if (!startDate || !endDate) {
      alert("Please specify a valid start and end stay date range.");
      return;
    }

    const totalDays = calculateDaysCount();
    const totalPrice = totalDays * pricePerDay;

    try {
      const activeDb = getDbState();
      
      // 1. Write booking row
      const nextBookingId = activeDb.bookings.length + 1;
      const newBookingRow = {
        id: nextBookingId,
        user_id: loggedInUser.id,
        pet_id: selectedPetId,
        provider_id: providerId,
        service_type: 'Boarding Stay',
        booking_date: startDate,
        status: 'confirmed',
        amount: totalPrice
      };
      activeDb.bookings.push(newBookingRow);

      // 2. Write payment row
      const nextPaymentId = activeDb.payments.length + 1;
      activeDb.payments.push({
        id: nextPaymentId,
        booking_id: nextBookingId,
        amount: totalPrice,
        payment_method: paymentMode === 'UPI' ? 'UPI / QR Code' : 'Debit Card',
        status: 'success',
        payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      // 3. Increment segment statistics for predictive analytics & scoring
      const segmentRow = activeDb.user_segments.find(s => s.user_id === loggedInUser.id);
      if (segmentRow) {
        segmentRow.total_bookings += 1;
        segmentRow.total_spent += totalPrice;
        segmentRow.last_active = new Date().toISOString().substring(0, 10);
        
        // Elevate category thresholds based on spending
        if (segmentRow.total_spent >= 15000) {
          segmentRow.segment_name = 'Premium Users';
        } else if (segmentRow.total_bookings >= 4) {
          segmentRow.segment_name = 'Frequent Users';
        } else if (segmentRow.total_bookings >= 2) {
          segmentRow.segment_name = 'Seasonal Users';
        }
      }

      // 4. Create verified notifications payload
      activeDb.notifications.push({
        id: activeDb.notifications.length + 1,
        user_id: loggedInUser.id,
        message: `Reservation Confirmed! 🎉 Stay booked starting ${startDate} (${totalDays} days). Transaction ID: #TXN${nextPaymentId}. Sitter is notified.`,
        is_read: false,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      // Commit transaction
      saveDbState(activeDb);

      alert(`🐾 Success! Your booking of ₹${totalPrice.toLocaleString('en-IN')} is recorded in the SQL transaction logs. Provider notified.`);
      
      // Reset checkout states & navigate
      setActiveBookingProviderId(null);
      setStartDate('');
      setEndDate('');
      setSpecialInstruct('');
      navigate('dashboard');

    } catch (err) {
      console.error("Boarding checkout transaction failed:", err);
    }
  };

  return (
    <div className="py-12 bg-brand-orange-50/50 text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <BackButton onClick={() => navigate('services')} />
        
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-brand-orange-100 text-brand-orange-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Premium Boarding
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-teal-900 mt-2 font-sans tracking-tight">
            Home Away From Home Stays
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600">
            Browse our verified community of trusted, pet-loving caregivers who can't wait to treat your buddy like family.
          </p>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase font-sans">Filters:</span>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange-500"
            >
              <option value="">All Cities (India)</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Pune">Pune</option>
            </select>

            <select
              value={priceSort}
              onChange={e => setPriceSort(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange-500"
            >
              <option value="All">Sort By Price</option>
              <option value="LowToHigh">Price: Low to High</option>
              <option value="HighToLow">Price: High to Low</option>
            </select>
          </div>

          {loggedInUser && userPets.length > 0 && (
            <div className="flex items-center gap-2.5 bg-brand-teal-50/70 p-2 rounded-xl border border-brand-teal-100/50">
              <span className="text-[11px] font-bold text-brand-teal-800">Configure score for:</span>
              <select
                value={selectedPetId || ''}
                onChange={e => setSelectedPetId(Number(e.target.value))}
                className="bg-white text-xs border border-brand-teal-200/50 rounded py-0.5 px-2 text-brand-teal-900 font-semibold"
              >
                {userPets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Caregiver Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCaregivers.length > 0 ? (
            filteredCaregivers.map(host => {
              // Read compatibility score
              const candidatePet = db.pets.find(p => p.id === selectedPetId);
              const compScore = candidatePet ? calculateServiceCompatibility(candidatePet, host) : null;
              
              const isCheckingOut = activeBookingProviderId === host.id;

              return (
                <div key={host.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="relative">
                      <img className="w-full h-52 object-cover" src={host.image_url || 'https://picsum.photos/seed/host/600/400'} alt={host.name} />
                      {compScore != null && (
                      <div className="absolute top-3 right-3 bg-brand-teal-700 text-white ...">
                    ⚡ {compScore.score}% Match
                      </div>
                    )}
                    </div>

                    <div className="p-6 text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider">{host.location}, {host.city}</p>
                      <h3 className="text-xl font-extrabold text-[#0D2C24] mt-1">{host.name}</h3>
                      
                      <div className="flex items-center gap-2 mt-2 border-b border-gray-100 pb-3">
                        <StarRating rating={host.rating} />
                        <span className="text-xs text-gray-500 font-semibold">({host.rating}) Sitter Rating</span>
                      </div>

                      {/* Display Caregiver Tags */}
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {host.compatibility_tags.map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="text-[10px] bg-brand-orange-50 text-brand-orange-700 px-2 py-0.5 rounded font-semibold font-mono">
                            #{tag.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sub Booking checkout Drawer container */}
                  <div className="px-6 pb-6 pt-2">
                    {isCheckingOut ? (
                      <div className="bg-brand-orange-50/50 p-4 rounded-xl border border-brand-orange-100/50 mb-4 space-y-3 text-xs text-left">
                        <h4 className="font-extrabold text-brand-teal-900 border-b border-gray-200 pb-1.5">Checkout Parameters</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Check-in</label>
                            <input
                              required
                              type="date"
                              value={startDate}
                              onChange={e => setStartDate(e.target.value)}
                              className="w-full bg-white border rounded p-1 text-xs"
                              min={new Date().toISOString().substring(0, 10)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Check-out</label>
                            <input
                              required
                              type="date"
                              value={endDate}
                              onChange={e => setEndDate(e.target.value)}
                              className="w-full bg-white border rounded p-1 text-xs"
                              min={startDate || new Date().toISOString().substring(0, 10)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Instructions for {host.name}</label>
                          <input
                            type="text"
                            value={specialInstruct}
                            onChange={e => setSpecialInstruct(e.target.value)}
                            className="w-full bg-white border rounded p-1 text-xs"
                            placeholder="E.g., feed twice. Needs medicine."
                          />
                        </div>

                        {/* Payment gateway select options */}
                        <div className="border-t border-gray-200 pt-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">UPI Address or Card Settle</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMode('UPI')}
                              className={`flex-1 py-1 rounded text-[11px] font-bold transition-colors ${
                                paymentMode === 'UPI' ? 'bg-brand-teal-700 text-white' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              ⚡ UPI QR Pay
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMode('Card')}
                              className={`flex-1 py-1 rounded text-[11px] font-bold transition-colors ${
                                paymentMode === 'Card' ? 'bg-brand-teal-700 text-white' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              💳 Card Pay
                            </button>
                          </div>

                          {paymentMode === 'UPI' ? (
                            <div className="mt-2 text-center p-2.5 bg-white border border-brand-teal-100 rounded-lg flex items-center justify-between">
                              <span className="font-mono text-[10px] font-semibold text-gray-400">UPI Address Code:</span>
                              <span className="font-mono text-xs font-black text-brand-teal-800">{upiAddress}</span>
                            </div>
                          ) : (
                            <input
                              required
                              type="text"
                              value={cardNumber}
                              onChange={e => setCardNumber(e.target.value)}
                              className="w-full bg-white border rounded p-1 text-xs mt-2 font-mono"
                              placeholder="4242 •••• •••• 1039"
                            />
                          )}
                        </div>

                        <div className="text-right font-bold text-sm text-[#0D2C24]">
                          Bill Total: <span className="font-mono text-brand-teal-900">₹{calculateTotalBill(host.price_per_unit).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveBookingProviderId(null)}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 py-1.5 rounded-full"
                          >
                            ✕ Cancel
                          </button>
                          <button
                            onClick={() => handleConfirmBooking(host.id, host.price_per_unit)}
                            className="flex-1 bg-brand-orange-500 hover:bg-brand-orange-600 font-bold text-white py-1.5 rounded-full"
                          >
                            Confirm & Pay
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                        <p className="text-lg font-black text-[#0D2C24]">
                          ₹{host.price_per_unit.toLocaleString('en-IN')} <span className="font-normal text-xs text-gray-400">/ day</span>
                        </p>
                        <button
                          onClick={() => {
                            setActiveBookingProviderId(host.id);
                          }}
                          className="bg-brand-orange-500 text-white font-extrabold text-xs py-2 px-5 rounded-full hover:bg-brand-orange-600 hover:scale-105 transition-all shadow"
                        >
                          Book Stay Now
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-20 bg-white rounded-3xl border border-gray-150 text-gray-450 text-sm font-semibold">
              No matching boarding hosts found in your selected area. Please adjust your criteria.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HostingPage;
