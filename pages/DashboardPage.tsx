import React, { useState, useEffect } from 'react';
import type { User, Page } from '../types';
import { getDbState, saveDbState, calculateFoodRecommendation, calculateServiceCompatibility } from '../lib/db';

interface DashboardPageProps {
  user: User;
  navigate: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, navigate }) => {
  const [db, setDb] = useState(getDbState());
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  
  // New pet form inputs
  const [newPetName, setNewPetName] = useState('');
  const [newPetType, setNewPetType] = useState<'Dog' | 'Cat' | 'Other'>('Dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('');
  const [newPetSize, setNewPetSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [newPetTemp, setNewPetTemp] = useState<'Friendly' | 'Energetic' | 'Calm' | 'Playful' | 'Anxious'>('Friendly');
  const [newPetAllergy, setNewPetAllergy] = useState('');
  const [newPetActivity, setNewPetActivity] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [newPetBudget, setNewPetBudget] = useState<'Budget' | 'Moderate' | 'Premium'>('Moderate');

  // Review state
  const [rateBookingId, setRateBookingId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Fetch updated records
  const updateLocalState = () => {
    const updated = getDbState();
    setDb(updated);
    
    // Find matching user row
    const userRow = updated.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (userRow) {
      setCurrentUserProfile(userRow);
      // set primary pet
      const userPets = updated.pets.filter(p => p.owner_id === userRow.id);
      if (userPets.length > 0 && selectedPetId === null) {
        setSelectedPetId(userPets[0].id);
      }
    }
  };

  useEffect(() => {
    updateLocalState();
  }, [user]);

  // Handle adding new pet profile
  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserProfile) return;

    try {
      const activeDb = getDbState();
      const nextPetId = activeDb.pets.length + 1;
      const petAgeNum = parseInt(newPetAge) || 1;
      const petWeightNum = parseInt(newPetWeight) || 10;

      const newPetRow = {
        id: nextPetId,
        owner_id: currentUserProfile.id,
        name: newPetName,
        type: newPetType,
        breed: newPetBreed || (newPetType === 'Dog' ? 'Golden Retriever' : 'Persian Cat'),
        age: petAgeNum,
        weight: petWeightNum,
        size: newPetSize,
        temperament: newPetTemp,
        allergies: newPetAllergy || 'None',
        activity_level: newPetActivity,
        budget: newPetBudget,
        image_url: newPetType === 'Dog' 
          ? 'https://picsum.photos/seed/buddy/400/300' 
          : (newPetType === 'Cat' ? 'https://picsum.photos/seed/bella/400/300' : 'https://picsum.photos/seed/charlie/400/300')
      };

      activeDb.pets.push(newPetRow);

      // Create profile record
      activeDb.pet_profiles.push({
        id: activeDb.pet_profiles.length + 1,
        pet_id: nextPetId,
        dietary_pref: newPetAllergy ? `Strict allergy avoidance: no ${newPetAllergy}` : 'Standard healthy meal schedule',
        medical_history: 'Registered and fully vaccinated.'
      });

      // Update segment activity
      const segmentRow = activeDb.user_segments.find(s => s.user_id === currentUserProfile.id);
      if (segmentRow) {
        segmentRow.last_active = new Date().toISOString().substring(0, 10);
      }

      saveDbState(activeDb);
      
      // Reset state
      setNewPetName('');
      setNewPetBreed('');
      setNewPetAge('');
      setNewPetWeight('');
      setSelectedPetId(nextPetId);
      setShowAddPetForm(false);
      updateLocalState();

      alert(`✓ Dynamic Schema Updated! Added profile for ${newPetName} to relational 'pets' table.`);
    } catch (err) {
      console.error("Pet add failed:", err);
    }
  };

  // Handle submitting review rating
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateBookingId || !currentUserProfile) return;

    try {
      const activeDb = getDbState();
      const booking = activeDb.bookings.find(b => b.id === rateBookingId);
      if (!booking) return;

      const nextReviewId = activeDb.reviews.length + 1;
      const newReview = {
        id: nextReviewId,
        provider_id: booking.provider_id,
        user_id: currentUserProfile.id,
        rating: reviewRating,
        comment: reviewComment,
        review_date: new Date().toISOString().substring(0, 10)
      };

      activeDb.reviews.push(newReview);

      // Recalculate provider aggregate rating in service_providers
      const provider = activeDb.service_providers.find(p => p.id === booking.provider_id);
      if (provider) {
        const providerReviews = activeDb.reviews.filter(r => r.provider_id === provider.id);
        const totalScore = providerReviews.reduce((sum, r) => sum + r.rating, 0);
        provider.rating = Number((totalScore / providerReviews.length).toFixed(1));
        provider.review_count = providerReviews.length;
      }

      // Mark booking as reviewed / completed
      booking.status = 'completed';

      saveDbState(activeDb);
      setRateBookingId(null);
      setReviewComment('');
      setReviewRating(5);
      updateLocalState();

      alert(`✓ Review Submitted! Caregiver rating re-weighted to ${provider?.rating || 'verified'}/5.`);
    } catch (err) {
      console.error("Review submit failed:", err);
    }
  };

  // Derived records
  const userRow = db.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
  const ownerId = userRow ? userRow.id : -1;
  const userPets = db.pets.filter(p => p.owner_id === ownerId);
  const activePet = db.pets.find(p => p.id === selectedPetId);
  const userBookings = db.bookings.filter(b => b.user_id === ownerId);
  const userOrders = db.orders.filter(o => o.user_id === ownerId);

  // Calorie & food plans
  const foodRecommendations = activePet 
    ? calculateFoodRecommendation({
        breed: activePet.breed,
        age: activePet.age,
        weight: activePet.weight,
        size: activePet.size,
        allergies: activePet.allergies,
        activity_level: activePet.activity_level,
        budget: activePet.budget
      })
    : [];

  return (
    <div className="py-12 bg-brand-orange-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header summary welcome */}
        <div className="bg-gradient-to-r from-brand-teal-700 to-brand-teal-800 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-12 -translate-y-12">
            <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 100 100">
              <path d="M70,30 C65,22 55,20 48,26 C41,20 31,22 26,30 C20,38 22,48 30,55 C38,62 48,70 48,70 C48,70 58,62 66,55 C74,48 76,38 70,30 Z" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-brand-orange-500 text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                Owner Dashboard
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Welcome home, {currentUserProfile?.name || user.name}! 🐾
              </h1>
              <p className="mt-2 text-brand-teal-100 max-w-xl text-sm leading-relaxed">
                Connect and manage everything your pets need. Track nutrition plans, schedule walks, look up vet logs, and check diagnostics records below.
              </p>
            </div>
            <button
              onClick={() => navigate('profile')}
              className="mt-4 md:mt-0 bg-white text-brand-teal-850 hover:bg-brand-orange-100 font-extrabold px-6 py-3 rounded-full hover:scale-105 transition-all text-sm shadow-md"
            >
              ⚙ Edit Profiles
            </button>
          </div>
        </div>

        {/* Outer Bento Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Pets management & Profiles add */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-brand-teal-850">My Pets ({userPets.length})</h3>
                <button
                  onClick={() => setShowAddPetForm(!showAddPetForm)}
                  className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-bold text-xs py-1.5 px-3 rounded-full transition-colors flex items-center gap-1.5"
                >
                  {showAddPetForm ? '✕ Close' : '＋ Add Pet'}
                </button>
              </div>

              {showAddPetForm ? (
                // Add Pet Form Layout
                <form onSubmit={handleAddPet} className="space-y-4">
                  <h4 className="text-xs font-bold text-brand-orange-600 uppercase tracking-widest">Register New Pet Entity</h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Pet Name</label>
                    <input required type="text" value={newPetName} onChange={e => setNewPetName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-brand-orange-500" placeholder="e.g. Max"/>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Type</label>
                      <select value={newPetType} onChange={e => setNewPetType(e.target.value as any)} className="mt-1 block w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs">
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Breed</label>
                      <input required type="text" value={newPetBreed} onChange={e => setNewPetBreed(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs" placeholder="e.g. Pug"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Age (Years)</label>
                      <input required type="number" value={newPetAge} onChange={e => setNewPetAge(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs" placeholder="3"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Weight (KG)</label>
                      <input required type="number" value={newPetWeight} onChange={e => setNewPetWeight(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs" placeholder="15"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Size</label>
                      <select value={newPetSize} onChange={e => setNewPetSize(e.target.value as any)} className="mt-1 block w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs">
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Temperament</label>
                      <select value={newPetTemp} onChange={e => setNewPetTemp(e.target.value as any)} className="mt-1 block w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs">
                        <option value="Friendly">Friendly</option>
                        <option value="Energetic">Energetic</option>
                        <option value="Calm">Calm</option>
                        <option value="Playful">Playful</option>
                        <option value="Anxious">Anxious</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Activity Level</label>
                      <select value={newPetActivity} onChange={e => setNewPetActivity(e.target.value as any)} className="mt-1 block w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs">
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Budget</label>
                      <select value={newPetBudget} onChange={e => setNewPetBudget(e.target.value as any)} className="mt-1 block w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs">
                        <option value="Budget">Budget</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Allergies</label>
                    <input type="text" value={newPetAllergy} onChange={e => setNewPetAllergy(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono" placeholder="Gluten / Seafood / None"/>
                  </div>
                  <button type="submit" className="w-full bg-brand-orange-500 font-bold hover:bg-brand-orange-600 text-white text-xs py-2 rounded-full transition-transform transform hover:scale-103 shadow">
                    ✓ Insert Row in SQL State
                  </button>
                </form>
              ) : (
                // Selected Pets Cards layout list
                <div className="space-y-3">
                  {userPets.length > 0 ? (
                    userPets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPetId(p.id)}
                        className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all duration-300 ${
                          selectedPetId === p.id 
                            ? 'bg-brand-teal-50/70 border-brand-teal-400 shadow-sm' 
                            : 'bg-gray-55 bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        <img className="w-12 h-12 rounded-full object-cover" src={p.image_url} alt={p.name} />
                        <div className="flex-grow">
                          <h4 className="font-extrabold text-brand-teal-900 text-sm flex justify-between">
                            <span>{p.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">ID: #{p.id}</span>
                          </h4>
                          <p className="text-xs text-gray-500 font-semibold">{p.breed} • {p.age} Years</p>
                          <div className="mt-1.5 flex gap-1 flex-wrap">
                            <span className="text-[9px] bg-brand-teal-100/50 text-brand-teal-800 font-bold px-1.5 py-0.5 rounded">
                              {p.temperament}
                            </span>
                            <span className="text-[9px] bg-brand-orange-100/50 text-brand-orange-700 font-bold px-1.5 py-0.5 rounded">
                              {p.activity_level} Activity
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-xs">
                      No pets registered yet. Click Add Pet above to begin.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick stats / segments info */}
            {currentUserProfile && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-sm font-bold text-brand-teal-850 mb-3 uppercase tracking-wider">Account Database Audit</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Email Reference</span>
                    <span className="font-mono text-gray-700 font-bold">{currentUserProfile.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Relational Segment</span>
                    <span className="font-bold text-brand-orange-600">
                      {db.user_segments.find(s => s.user_id === currentUserProfile.id)?.segment_name || 'Occasional Client'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Aggregate Spent</span>
                    <span className="font-mono font-bold text-brand-teal-700">₹{db.user_segments.find(s => s.user_id === currentUserProfile.id)?.total_spent || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px] leading-relaxed pt-1">
                    <span>*Segmentation & loyalty rankings auto-classify on SQL checkout completions.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Dynamic recommendations, order and ratings */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* AI Custom food plan recommendations */}
            {activePet ? (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold bg-brand-teal-100 text-brand-teal-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">ML Scoring Models</span>
                    <h3 className="text-lg font-bold text-brand-teal-850 mt-1">Recommended Nutrition Plans for {activePet.name}</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-mono font-bold">Parameters: {activePet.weight}kg • {activePet.activity_level} Engine</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {foodRecommendations.slice(0, 2).map((rec, rIdx) => (
                    <div key={rIdx} className="p-5 rounded-2xl border border-brand-orange-100 bg-brand-orange-50/20 hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-extrabold text-[#0D2C24] text-sm leading-snug">{rec.brand}</h4>
                          <span className="text-xs bg-brand-orange-100 text-brand-orange-600 font-bold px-2 py-0.5 rounded-full font-mono">
                            📊 {rec.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-semibold mb-3">{rec.rationale}</p>
                        
                        <div className="grid grid-cols-2 gap-2 bg-white/70 p-2.5 rounded-xl border border-gray-150 text-[10px] mb-4">
                          <div>
                            <span className="text-gray-400 block font-bold">DAILY ENERGY</span>
                            <span className="font-mono font-bold text-gray-800">{rec.dailyCaloriesKcal} Kcal</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-bold">SERVES PORTION</span>
                            <span className="font-mono font-bold text-gray-800">{rec.weeklyServingGrams / 7}g / day</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                        <span className="text-xs font-black text-brand-teal-800">₹{rec.price} <span className="font-normal text-[10px] text-gray-400">/ month</span></span>
                        <button
                          onClick={() => navigate('food')}
                          className="text-xs font-bold text-brand-orange-600 hover:scale-105 transition-transform"
                        >
                          Refill Nutrition &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center py-10 text-gray-500 text-xs">
                Seeding diagnostic recommendations parameters. Please register/select pet on left coordinate.
              </div>
            )}

            {/* Past Bookings & Orders History */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-brand-teal-850 mb-4 border-b border-gray-100 pb-3">My Relational History Records</h3>
              
              {/* Rating popup overlay inline */}
              {rateBookingId && (
                <div className="mb-6 p-5 border border-brand-orange-200 bg-brand-orange-50/40 rounded-2xl text-xs space-y-4">
                  <h4 className="font-extrabold text-brand-teal-900 flex justify-between items-center">
                    <span>Rate Booking Experience #{rateBookingId}</span>
                    <button onClick={() => setRateBookingId(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕ Cancel</button>
                  </h4>
                  <form onSubmit={handleSubmitRating} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">Select Score Star:</span>
                      <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="bg-white border text-xs px-2 py-1 rounded">
                        <option value="5">5 Stars (Elite Sitter)</option>
                        <option value="4">4 Stars (Good Stay)</option>
                        <option value="3">3 Stars (Moderate)</option>
                        <option value="2">2 Stars (Average)</option>
                        <option value="1">1 Star (Poor Experience)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Detailed Comment</label>
                      <textarea required value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2} className="w-full bg-white border rounded p-2 focus:ring-brand-orange-500 text-xs" placeholder="How did they handle your pet? E.g., very caring sitter..."/>
                    </div>
                    <button type="submit" className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold py-1.5 px-4 rounded-full shadow">
                      ✓ Write Review Row to Database
                    </button>
                  </form>
                </div>
              )}

              {/* Bookings Table */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-extrabold text-brand-teal-700 uppercase tracking-widest mb-3">Service Appointments ({userBookings.length})</h4>
                  {userBookings.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl bg-gray-50/20">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-left">
                          <tr>
                            <th className="px-4 py-3">Booking ID</th>
                            <th className="px-4 py-3">Caregiver Provider</th>
                            <th className="px-4 py-3">Scheduled Date</th>
                            <th className="px-4 py-3">Bill Total</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Review Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userBookings.map((b) => {
                            const provider = db.service_providers.find(p => p.id === b.provider_id) || { name: 'Local Caregiver' };
                            const statusColor = b.status === 'completed' 
                              ? 'text-green-700 bg-green-100' 
                              : (b.status === 'cancelled' ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100');
                            
                            // Check if already reviewed
                            const hasReview = db.reviews.some(r => r.provider_id === b.provider_id && r.user_id === ownerId);

                            return (
                              <tr key={b.id}>
                                <td className="px-4 py-3 font-mono text-gray-500">#BK{b.id}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800 text-left">{provider.name}</td>
                                <td className="px-4 py-3 font-mono text-left">{b.booking_date}</td>
                                <td className="px-4 py-3 font-mono font-bold text-gray-800 text-left">₹{b.amount}</td>
                                <td className="px-4 py-3 text-left">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${statusColor}`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-left">
                                  {b.status === 'completed' ? (
                                    hasReview ? (
                                      <span className="text-gray-400 text-[10px] font-bold">✓ Rated Received</span>
                                    ) : (
                                      <button
                                        onClick={() => setRateBookingId(b.id)}
                                        className="text-brand-orange-500 font-bold hover:underline"
                                      >
                                        ⭐ Rate Caregiver
                                      </button>
                                    )
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 text-xs">
                      No service bookings recorded inside local database. Select "Services" tab above to book.
                    </div>
                  )}
                </div>

                {/* Orders Table */}
                <div>
                  <h4 className="text-xs font-extrabold text-brand-teal-700 uppercase tracking-widest mb-3 font-sans">E-Commerce Orders ({userOrders.length})</h4>
                  {userOrders.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl bg-gray-50/20">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-left">
                          <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">Diet Product Item</th>
                            <th className="px-4 py-3">Dispatch Date</th>
                            <th className="px-4 py-3">Price Paid</th>
                            <th className="px-4 py-3">Tracking Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userOrders.map((o) => (
                            <tr key={o.id}>
                              <td className="px-4 py-3 font-mono text-gray-500">#ORD{o.id}</td>
                              <td className="px-4 py-3 font-semibold text-gray-800 text-left">{o.product_name}</td>
                              <td className="px-4 py-3 font-mono text-left">{o.order_date}</td>
                              <td className="px-4 py-3 font-mono font-bold text-gray-800 text-left">₹{o.amount}</td>
                              <td className="px-4 py-3 text-left">
                                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                  o.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 text-xs">
                      No custom diet orders recorded. Visit "Custom Pet Food" to configure subscriptions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
