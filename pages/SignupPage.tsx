import React, { useState } from 'react';
import type { Page, User } from '../types';
import { PawPrintIcon } from '../components/icons/PawPrintIcon';
import { getDbState, saveDbState } from '../lib/db';

interface SignupPageProps {
  navigate: (page: Page) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ navigate }) => {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    password: '',
    city: '',
    petType: 'Dog',
  });
  const [petDetails, setPetDetails] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    size: 'Medium' as 'Small' | 'Medium' | 'Large',
    temperament: 'Friendly' as 'Friendly' | 'Energetic' | 'Calm' | 'Playful' | 'Anxious',
    allergies: '',
    activityLevel: 'Moderate' as 'Low' | 'Moderate' | 'High',
    budget: 'Moderate' as 'Budget' | 'Moderate' | 'Premium',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as User));
  };

  const handlePetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPetDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const db = getDbState();
      const existingUser = db.users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());

      if (existingUser) {
        alert("An account with this email already exists. Please login.");
        return;
      }

      // 1. Create unique user entry
      const nextUserId = db.users.length + 1;
      const newUser = {
        id: nextUserId,
        name: formData.name,
        email: formData.email,
        password: formData.password || '12345',
        city: formData.city,
        petType: formData.petType,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      db.users.push(newUser);

      // 2. Create corresponding pet & pet profile
      const nextPetId = db.pets.length + 1;
      const petAgeNum = parseInt(petDetails.age) || 1;
      const petWeightNum = parseInt(petDetails.weight) || 10;
      const mappedPet = {
        id: nextPetId,
        owner_id: nextUserId,
        name: petDetails.name || `${formData.name}'s ${formData.petType}`,
        type: formData.petType,
        breed: petDetails.breed || (formData.petType === 'Dog' ? 'Golden Retriever' : 'Persian Cat'),
        age: petAgeNum,
        weight: petWeightNum,
        size: petDetails.size,
        temperament: petDetails.temperament,
        allergies: petDetails.allergies || 'None',
        activity_level: petDetails.activityLevel,
        budget: petDetails.budget,
        image_url: formData.petType === 'Dog' 
          ? 'https://picsum.photos/seed/buddy/400/300' 
          : (formData.petType === 'Cat' ? 'https://picsum.photos/seed/bella/400/300' : 'https://picsum.photos/seed/charlie/400/300')
      };

      db.pets.push(mappedPet);

      // Create advanced profile
      db.pet_profiles.push({
        id: db.pet_profiles.length + 1,
        pet_id: nextPetId,
        dietary_pref: petDetails.allergies ? `Hypoallergenic safe: No ${petDetails.allergies}` : 'Standard healthy diet',
        medical_history: 'Registered. General health stable.'
      });

      // 3. Setup customer segment
      db.user_segments.push({
        id: db.user_segments.length + 1,
        user_id: nextUserId,
        segment_name: 'Occasional Users',
        total_bookings: 0,
        total_spent: 0,
        last_active: new Date().toISOString().substring(0, 10)
      });

      // 4. Save to our relational DB
      saveDbState(db);

      // Fallback synchronization for legacy components
      const legacyUsers = JSON.parse(localStorage.getItem("petpalUsers") || "[]");
      legacyUsers.push({ ...formData });
      localStorage.setItem("petpalUsers", JSON.stringify(legacyUsers));

      alert(`Signup successful! User #${newUser.id} registered. Let's log in to configure recommendations for ${mappedPet.name || 'your pet'}.`);
      navigate('login');

    } catch (error) {
      console.error("Signup failed:", error);
      alert("An error occurred during signup. Please try again.");
    }
  };

  return (
    <div className="py-12 sm:py-20 bg-brand-orange-50 flex items-center justify-center min-h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <PawPrintIcon className="w-12 h-12 mx-auto text-brand-orange-400 mb-2" />
          <h1 className="text-3xl font-bold text-brand-teal-800 text-center mb-1">Join the PetPal Family</h1>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Create an integrated account for real-time diagnostics, machine-learning recommendations, and booking histories.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-brand-teal-700 mb-3 flex items-center gap-2">
                <span className="bg-brand-teal-100 text-brand-teal-800 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">1</span>
                User Owner Profile
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Owner Name</label>
                  <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-orange-500 focus:border-brand-orange-500" placeholder="e.g. Ramesh Kumar"/>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Email Address</label>
                  <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-orange-500 focus:border-brand-orange-500" placeholder="ramesh@example.com"/>
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Password</label>
                  <input type="password" name="password" id="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-orange-500 focus:border-brand-orange-500"/>
                </div>
                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">City</label>
                  <input type="text" name="city" id="city" required value={formData.city} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-orange-500 focus:border-brand-orange-500" placeholder="e.g. Bengaluru"/>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-brand-teal-700 mb-3 flex items-center gap-2">
                <span className="bg-brand-teal-100 text-brand-teal-800 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">2</span>
                Pet Profile (Feeds Recommendation Engine)
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="petName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Pet Name</label>
                  <input type="text" name="name" id="petName" required value={petDetails.name} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-orange-500 focus:border-brand-orange-500" placeholder="e.g., Bruno"/>
                </div>
                <div>
                  <label htmlFor="petType" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Pet Category</label>
                  <select name="petType" id="petType" required value={formData.petType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-brand-orange-500">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="breed" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Breed</label>
                  <input type="text" name="breed" id="breed" required value={petDetails.breed} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Beagle / Indie"/>
                </div>
                <div>
                  <label htmlFor="age" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Age (Years)</label>
                  <input type="number" name="age" id="age" required value={petDetails.age} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="2"/>
                </div>
                <div>
                  <label htmlFor="weight" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Weight (KG)</label>
                  <input type="number" name="weight" id="weight" required value={petDetails.weight} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="12"/>
                </div>
                <div>
                  <label htmlFor="size" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Pet Size</label>
                  <select name="size" id="size" required value={petDetails.size} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="temperament" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Temperament</label>
                  <select name="temperament" id="temperament" required value={petDetails.temperament} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="Friendly">Friendly</option>
                    <option value="Energetic">Energetic</option>
                    <option value="Calm">Calm</option>
                    <option value="Playful">Playful</option>
                    <option value="Anxious">Anxious</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="activityLevel" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Activity Level</label>
                  <select name="activityLevel" id="activityLevel" required value={petDetails.activityLevel} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="budget" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Service Budget</label>
                  <select name="budget" id="budget" required value={petDetails.budget} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="Budget">Budget</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="allergies" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Food Allergies / Pref</label>
                  <input type="text" name="allergies" id="allergies" value={petDetails.allergies} onChange={handlePetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="None / Gluten / Chicken"/>
                </div>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-semibold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 transition-colors duration-300 mt-2">
                Create Relational Account & Profiles
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="font-semibold text-brand-teal-600 hover:text-brand-teal-500 underline">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
