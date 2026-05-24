
import React from 'react';
import type { Page } from '../types';
import { PawPrintIcon } from '../components/icons/PawPrintIcon';

interface HomePageProps {
    navigate: (page: Page) => void;
}

const CtaButton: React.FC<{ onClick: () => void; children: React.ReactNode, primary?: boolean }> = ({ onClick, children, primary=false }) => (
    <button
        onClick={onClick}
        className={`w-full sm:w-auto text-center px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg
        ${primary 
            ? 'bg-brand-orange-500 text-white hover:bg-brand-orange-600' 
            : 'bg-white text-brand-orange-600 hover:bg-brand-orange-100'
        }`}
    >
        {children}
    </button>
);

const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-brand-orange-100 pt-20 pb-32 text-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://picsum.photos/seed/pet-bg/1920/1080')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-orange-50 via-transparent"></div>
                
                <div className="relative container mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-brand-teal-800 leading-tight">
                        Your Pet’s Best Pal, <br className="hidden sm:block" /> Anytime, Anywhere 🐶🐱
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                        PetPal connects loving pet owners with trusted local caregivers, offering a one-stop solution for all your pet's needs. Convenience, compassion, and connection, all in one place.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <CtaButton onClick={() => navigate('services')} primary>Find a Caregiver</CtaButton>
                        <CtaButton onClick={() => navigate('community')}>Join the Community</CtaButton>
                        <CtaButton onClick={() => navigate('services')}>Book a Trainer</CtaButton>
                    </div>
                </div>
            </section>

            {/* Why PetPal Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <PawPrintIcon className="w-12 h-12 mx-auto text-brand-orange-400 mb-4"/>
                    <h2 className="text-3xl font-bold text-brand-teal-800 mb-4">Making Pet Care Simpler & More Social</h2>
                    <p className="max-w-3xl mx-auto text-gray-600 mb-12">
                        We believe that every pet deserves the best care, and every owner deserves peace of mind. PetPal is more than just a service; it's a community built on a shared love for our furry, feathery, and scaly friends.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-brand-teal-700">Trusted Caregivers</h3>
                            <p className="mt-2 text-gray-500">Every caregiver is vetted and reviewed by our community, so you can rest easy.</p>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-brand-teal-700">All-in-One-Platform</h3>
                            <p className="mt-2 text-gray-500">From boarding to diet plans, find everything your pet needs in one convenient app.</p>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-brand-teal-700">A Vibrant Community</h3>
                            <p className="mt-2 text-gray-500">Connect with fellow pet lovers, share stories, and join local events.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing Section */}
            <section className="bg-brand-teal-600 text-white text-center py-16">
                 <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-semibold mb-4">"Pets leave paw prints on our hearts forever." 💛</h3>
                    <button onClick={() => navigate('community')} className="mt-4 bg-white text-brand-teal-600 px-8 py-3 rounded-full font-bold hover:bg-brand-teal-50 transition-colors duration-300">
                        Become a Pal
                    </button>
                 </div>
            </section>
        </div>
    );
};

export default HomePage;
