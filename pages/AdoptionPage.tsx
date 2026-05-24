import React from 'react';
import type { Page, AdoptablePet } from '../types';
import { ADOPTABLE_PETS } from '../constants';

interface AdoptionPageProps {
  navigate: (page: Page) => void;
}

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="inline-flex items-center gap-2 text-brand-teal-700 hover:text-brand-teal-900 transition-colors mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back to Services
    </button>
);

const PetCard: React.FC<{ pet: AdoptablePet }> = ({ pet }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
        <img className="w-full h-56 object-cover" src={pet.imageUrl} alt={pet.name} />
        <div className="p-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-brand-teal-800">{pet.name}</h3>
                <span className={`px-3 py-1 text-sm rounded-full ${pet.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>{pet.gender}</span>
            </div>
            <p className="text-gray-500 mt-1">{pet.breed} &bull; {pet.age}</p>
            <p className="text-sm text-gray-600 mt-2">From: {pet.shelter}</p>
            <p className="text-sm text-gray-600 mt-1">Adoption Fee: {pet.adoptionFeeInr > 0 ? `₹${pet.adoptionFeeInr}` : 'Free'}</p>
            <button className="w-full mt-4 bg-brand-orange-500 text-white font-bold py-2 px-4 rounded-full hover:bg-brand-orange-600 transition-colors duration-300">
                Adopt Me
            </button>
        </div>
    </div>
);

const AdoptionPage: React.FC<AdoptionPageProps> = ({ navigate }) => {
  return (
    <div className="py-16 sm:py-24 bg-brand-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onClick={() => navigate('services')} />
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-teal-800">Give a Furry Friend a Forever Home</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Browse our portal to find your new best friend from local shelters and rescues in India.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ADOPTABLE_PETS.map(pet => (
                <PetCard key={pet.id} pet={pet} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdoptionPage;