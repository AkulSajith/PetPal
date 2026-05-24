import React, { useState } from 'react';
import type { Page, PlaydateProfile } from '../types';
import { PLAYDATE_PROFILES } from '../constants';

interface PlaydatesPageProps {
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

const PlaydateCard: React.FC<{ profile: PlaydateProfile }> = ({ profile }) => (
    <div className="relative w-full max-w-sm mx-auto">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            <img className="w-full h-[450px] object-cover" src={profile.imageUrl} alt={profile.name} />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                <h3 className="text-3xl font-bold">{profile.name}, {profile.age}</h3>
                <p className="text-lg">{profile.breed} from {profile.location}</p>
                <p className="mt-2 text-sm bg-white/20 px-2 py-1 rounded-full inline-block">{profile.temperament}</p>
            </div>
        </div>
    </div>
);

const PlaydatesPage: React.FC<PlaydatesPageProps> = ({ navigate }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animationClass, setAnimationClass] = useState('opacity-100');
    
    const handleSwipe = () => {
        setAnimationClass('opacity-0 scale-95');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % PLAYDATE_PROFILES.length);
            setAnimationClass('opacity-100 scale-100');
        }, 300);
    };

    return (
    <div className="py-16 sm:py-24 bg-brand-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onClick={() => navigate('services')} />
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-teal-800">Find Your Pet’s Perfect Playmate!</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Connect with other pets in your area for fun, friendship, and zoomies.
          </p>
        </div>

        <div className="flex flex-col items-center">
            <div className={`transition-all duration-300 transform ${animationClass}`}>
                <PlaydateCard profile={PLAYDATE_PROFILES[currentIndex]} />
            </div>

            <div className="flex gap-8 mt-8">
                <button onClick={handleSwipe} className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-red-500 hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <button onClick={handleSwipe} className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-brand-teal-500 hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlaydatesPage;