import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState<Omit<User, 'password' | 'email'>>({
    name: '',
    city: '',
    petType: 'Dog',
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        city: user.city,
        petType: user.petType,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as Omit<User, 'password' | 'email'>));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = { ...user, ...formData };
    onUpdateUser(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
  };
  
  if (!user) {
      return null; // Or a loading spinner
  }

  return (
    <div className="py-16 sm:py-24 bg-brand-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-teal-800">Your Profile</h1>
            <p className="mt-4 text-lg text-gray-600">View and update your personal information.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
           <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Cannot be changed)</label>
                <input type="email" name="email" id="email" disabled value={user.email} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"/>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500"/>
            </div>
             <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" name="city" id="city" required value={formData.city} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500"/>
            </div>
            <div>
              <label htmlFor="petType" className="block text-sm font-medium text-gray-700">Primary Pet</label>
               <select name="petType" id="petType" required value={formData.petType} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500 bg-white">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" className="flex-grow justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-semibold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 transition-colors duration-300">
                Save Changes
              </button>
              {isSaved && (
                <span className="text-green-600 font-semibold whitespace-nowrap">✓ Saved!</span>
              )}
            </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
