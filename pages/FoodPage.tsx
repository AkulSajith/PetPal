import React, { useState, useEffect } from 'react';
import type { Page } from '../types';
import { getDbState, saveDbState, calculateFoodRecommendation } from '../lib/db';

interface FoodPageProps {
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

const FoodPage: React.FC<FoodPageProps> = ({ navigate }) => {
  const [db, setDb] = useState(getDbState());
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [petDetails, setPetDetails] = useState({
    name: '',
    type: 'Dog',
    breed: 'Beagle',
    age: '2',
    weight: '12',
    size: 'Medium' as 'Small' | 'Medium' | 'Large',
    allergies: '',
    activity_level: 'Moderate' as 'Low' | 'Moderate' | 'High',
    budget: 'Moderate' as 'Budget' | 'Moderate' | 'Premium',
  });

  const [recommendedPlans, setRecommendedPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  
  // Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card'>('UPI');
  const [cardNumber, setCardNumber] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('petpalLoggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const userRow = db.users.find(u => u.email.toLowerCase() === parsedUser.email.toLowerCase());
      if (userRow) {
        setLoggedInUser(userRow);
        const pets = db.pets.filter(p => p.owner_id === userRow.id);
        setUserPets(pets);
        if (pets.length > 0) {
          // Pre-fill with first pet
          const firstPet = pets[0];
          setPetDetails({
            name: firstPet.name,
            type: firstPet.type,
            breed: firstPet.breed,
            age: String(firstPet.age),
            weight: String(firstPet.weight),
            size: firstPet.size,
            allergies: firstPet.allergies || '',
            activity_level: firstPet.activity_level,
            budget: firstPet.budget,
          });
          
          const recs = calculateFoodRecommendation({
            breed: firstPet.breed,
            age: firstPet.age,
            weight: firstPet.weight,
            size: firstPet.size,
            allergies: firstPet.allergies,
            activity_level: firstPet.activity_level,
            budget: firstPet.budget,
          });
          setRecommendedPlans(recs);
        }
      }
    }
  }, []);

  // Handle selecting pet from pre-registered profiles
  const handlePetSelect = (petIdStr: string) => {
    if (!petIdStr) return;
    const petId = Number(petIdStr);
    const pet = db.pets.find(p => p.id === petId);
    if (pet) {
      setPetDetails({
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: String(pet.age),
        weight: String(pet.weight),
        size: pet.size,
        allergies: pet.allergies || '',
        activity_level: pet.activity_level,
        budget: pet.budget,
      });

      const recs = calculateFoodRecommendation({
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        size: pet.size,
        allergies: pet.allergies,
        activity_level: pet.activity_level,
        budget: pet.budget,
      });
      setRecommendedPlans(recs);
      setSelectedPlan(null);
      setShowCheckout(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPetDetails({ ...petDetails, [e.target.name]: e.target.value });
  };

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const recs = calculateFoodRecommendation({
      breed: petDetails.breed,
      age: parseInt(petDetails.age) || 2,
      weight: parseInt(petDetails.weight) || 12,
      size: petDetails.size,
      allergies: petDetails.allergies,
      activity_level: petDetails.activity_level,
      budget: petDetails.budget,
    });
    setRecommendedPlans(recs);
    setSelectedPlan(null);
    setShowCheckout(false);
  };

  const handleSettleOrder = () => {
    if (!loggedInUser) {
      alert("Please log in or sign up to subscribe to nutritional meal boxes.");
      navigate('login');
      return;
    }

    if (!selectedPlan) return;

    try {
      const activeDb = getDbState();
      const nextOrderId = activeDb.orders.length + 1;

      // 1. Insert order row
      activeDb.orders.push({
        id: nextOrderId,
        user_id: loggedInUser.id,
        product_name: `Monthly Subscription: ${selectedPlan.brand} (${selectedPlan.recipeName})`,
        amount: selectedPlan.price,
        order_date: new Date().toISOString().substring(0, 10),
        status: 'completed'
      });

      // 2. Insert payment row
      activeDb.payments.push({
        id: activeDb.payments.length + 1,
        order_id: nextOrderId,
        amount: selectedPlan.price,
        payment_method: paymentMode === 'UPI' ? 'UPI / QR Code' : 'Debit Card',
        status: 'success',
        payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      // 3. Update segment profiles
      const segmentRow = activeDb.user_segments.find(s => s.user_id === loggedInUser.id);
      if (segmentRow) {
        segmentRow.total_spent += selectedPlan.price;
        segmentRow.last_active = new Date().toISOString().substring(0, 10);
      }

      // 4. Update Notifications list
      activeDb.notifications.push({
        id: activeDb.notifications.length + 1,
        user_id: loggedInUser.id,
        message: `Subscription Active! 📦 Custom diet box containing [${selectedPlan.recipeName}] is now processing. Ship dispatched weekly.`,
        is_read: false,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      saveDbState(activeDb);

      alert(`🐾 Confirmed! Your nutrition subscription is registered in e-commerce logs. First batch will arrive in 3 business days.`);
      setShowCheckout(false);
      setSelectedPlan(null);
      navigate('dashboard');

    } catch (err) {
      console.error("Subscription transaction failed:", err);
    }
  };

  return (
    <div className="py-12 bg-brand-orange-50/50 text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <BackButton onClick={() => navigate('services')} />
        
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-brand-teal-100 text-brand-teal-850 text-xs font-bold rounded-full uppercase tracking-wider">
            Smart Nutrition
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0D2C24] mt-2 font-sans tracking-tight">
            Tailor-Made Meals, Delivered Weekly
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600">
            Tell our ML recommender about your buddy's physical habits and allergies, and calculate the perfect balanced nutrition recipe box.
          </p>
        </div>

        {/* Selected pre-registered pets shortcut banner */}
        {loggedInUser && userPets.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8 bg-brand-teal-50/60 p-4 rounded-2xl border border-brand-teal-100/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-bold text-brand-teal-800">⚡ Auto-fill parameters from your registered pet profile:</span>
            <select
              onChange={e => handlePetSelect(e.target.value)}
              className="bg-white text-xs border border-brand-teal-200 rounded py-1 px-3 text-brand-teal-900 font-bold"
            >
              <option value="">-- Choose Profile --</option>
              {userPets.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>
              ))}
            </select>
          </div>
        )}

        {/* Recommender Form and Custom Recommendation plans */}
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Form left */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-left">
            <h3 className="text-lg font-bold text-brand-teal-950 mb-4 border-b border-gray-100 pb-2">Diagnostic Parameters</h3>
            
            <form onSubmit={handleGeneratePlan} className="space-y-4 text-xs font-semibold text-gray-700">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase">Pet Name</label>
                <input required type="text" name="name" value={petDetails.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-200 rounded p-2 text-xs focus:ring-brand-orange-500" placeholder="e.g. Buddy"/>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase">Pet Type</label>
                  <select name="type" value={petDetails.type} onChange={handleInputChange} className="mt-1 block w-full bg-white border border-gray-200 rounded p-2 text-xs">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase">Breed</label>
                  <input required type="text" name="breed" value={petDetails.breed} onChange={handleInputChange} className="mt-1 block w-full border border-gray-200 rounded p-2 text-xs" placeholder="Beagle"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase">Age (Years)</label>
                  <input required type="number" name="age" value={petDetails.age} onChange={handleInputChange} className="mt-1 block w-full border border-gray-200 rounded p-2 text-xs"/>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase">Weight (KG)</label>
                  <input required type="number" name="weight" value={petDetails.weight} onChange={handleInputChange} className="mt-1 block w-full border border-gray-200 rounded p-2 text-xs"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase">Scaling Size</label>
                  <select name="size" value={petDetails.size} onChange={handleInputChange} className="mt-1 block w-full bg-white border border-gray-200 rounded p-2 text-xs">
                    <option value="Small">Small Size</option>
                    <option value="Medium">Medium Size</option>
                    <option value="Large">Large Size</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase">Activity Level</label>
                  <select name="activity_level" value={petDetails.activity_level} onChange={handleInputChange} className="mt-1 block w-full bg-white border border-gray-200 rounded p-2 text-xs">
                    <option value="Low">Low Activity</option>
                    <option value="Moderate">Moderate Walk</option>
                    <option value="High">High Energy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase">Food Allergy Constraints</label>
                <input type="text" name="allergies" value={petDetails.allergies} onChange={handleInputChange} className="mt-1 block w-full border border-gray-200 rounded p-2 text-xs font-mono" placeholder="Gluten / Seafood / None"/>
              </div>

              <button type="submit" className="w-full bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-extrabold text-xs py-2.5 rounded-full shadow transition-all">
                Generate Nutrition Models
              </button>
            </form>
          </div>

          {/* Recommendations right */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-brand-teal-50/60 p-6 rounded-2xl border border-brand-teal-100 shadow-lg mb-6">
              <h3 className="text-xl font-black text-brand-teal-950 text-left">AI / Data Science Model Output</h3>
              
              {recommendedPlans.length > 0 ? (
                <div className="space-y-4 mt-4 text-left">
                  {recommendedPlans.map((rec, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedPlan(rec);
                        setShowCheckout(true);
                      }}
                      className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        selectedPlan?.brand === rec.brand 
                          ? 'bg-white border-brand-orange-500 shadow-md ring-1 ring-brand-orange-400' 
                          : 'bg-white/80 border-gray-150 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <span className="text-[9px] font-mono font-bold bg-brand-teal-100 text-brand-teal-800 px-2 py-0.5 rounded">
                            {rec.recipeName}
                          </span>
                          <h4 className="text-base font-extrabold text-brand-teal-950 mt-1">{rec.brand}</h4>
                        </div>
                        <span className="text-xs bg-brand-orange-100 text-brand-orange-600 font-extrabold px-3 py-1 rounded-full font-mono">
                          📊 {rec.matchScore}% Match
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 font-semibold mt-2 leading-relaxed">{rec.rationale}</p>

                      <div className="grid grid-cols-3 gap-4 border-t border-gray-100 mt-4 pt-4 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block font-bold">Recommended Calorie Intake</span>
                          <span className="font-mono text-gray-800 font-bold">{rec.dailyCaloriesKcal} Kcal / day</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block font-bold">Standard Weekly Grams</span>
                          <span className="font-mono text-gray-800 font-bold">{rec.weeklyServingGrams}g</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase block font-bold">Subscription Cost</span>
                          <span className="font-mono text-brand-teal-900 font-black">₹{rec.price} / mo</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-left mt-2 leading-relaxed">
                  Scaffolding nutritional recommendations pipelines. Provide your pet details on the left dashboard to run the calorie classifier.
                </p>
              )}
            </div>

            {/* Sub checkout block */}
            {selectedPlan && showCheckout && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-brand-orange-100 text-left animate-fade-in space-y-4">
                <div className="flex justify-between border-b border-gray-150 pb-2">
                  <h4 className="font-extrabold text-brand-teal-950 text-sm">Checkout Order Details</h4>
                  <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">✕ Cancel</button>
                </div>

                <div className="text-xs space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Recipe Box Item:</span>
                    <span className="font-bold text-slate-800">{selectedPlan.brand} ({selectedPlan.recipeName})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Frequency:</span>
                    <span className="font-semibold">Weekly cycle (Free doorstep logistics)</span>
                  </div>
                  <div className="flex justify-between text-brand-teal-850 font-bold">
                    <span>Active Plan Total:</span>
                    <span className="font-mono font-black text-sm text-brand-teal-900">₹{selectedPlan.price} / Month</span>
                  </div>
                </div>

                <div className="border-t border-gray-150 pt-2 space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Specify billing gateway checkout</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPaymentMode('UPI')} className={`py-1.5 rounded cursor-pointer font-bold text-xs ${paymentMode === 'UPI' ? 'bg-brand-teal-700 text-white' : 'bg-gray-200 text-gray-500'}`}>⚡ UPI Pay</button>
                    <button type="button" onClick={() => setPaymentMode('Card')} className={`py-1.5 rounded cursor-pointer font-bold text-xs ${paymentMode === 'Card' ? 'bg-brand-teal-700 text-white' : 'bg-gray-200 text-gray-500'}`}>💳 Card</button>
                  </div>
                  {paymentMode === 'UPI' ? (
                    <div className="text-center p-2 text-xs font-mono font-bold border border-brand-teal-150 bg-brand-orange-50/10 rounded">
                      UPI QR ID: paynutripal@ybl
                    </div>
                  ) : (
                    <input required type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-[110%] md:w-full bg-white border text-xs p-1.5 rounded font-mono" placeholder="4242 •••• •••• 9830"/>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSettleOrder}
                  className="w-full bg-brand-orange-500 border-none rounded-full py-2.5 font-extrabold text-[#0D2C24] text-xs hover:bg-brand-orange-600 cursor-pointer shadow-md transition-transform transform hover:scale-102"
                >
                  ✓ Confirm Refill Subscription Order
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default FoodPage;
