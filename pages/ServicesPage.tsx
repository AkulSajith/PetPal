import React from 'react';
import type { Page, Service } from '../types';
import { SERVICES } from '../constants';

interface ServicesPageProps {
    navigate: (page: Page) => void;
}

const ServiceCard: React.FC<{ service: Service, navigate: (page: Page) => void }> = ({ service, navigate }) => {
    const { icon: Icon, title, description, pageLink } = service;
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center">
            <div className="p-4 bg-brand-orange-100 rounded-full mb-6">
                <Icon className="w-10 h-10 text-brand-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-brand-teal-800 mb-2">{title}</h3>
            <p className="text-gray-500 flex-grow">{description}</p>
            <button 
                onClick={() => navigate(pageLink)}
                className="mt-6 bg-brand-teal-50 text-brand-teal-700 px-5 py-2 rounded-full font-semibold hover:bg-brand-teal-100 transition-colors duration-300"
            >
                Learn More
            </button>
        </div>
    );
};

const ServicesPage: React.FC<ServicesPageProps> = ({ navigate }) => {
  return (
    <div className="py-16 sm:py-24 bg-brand-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-teal-800">Everything Your Pet Needs</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            From essential care to fun and friendship, explore our comprehensive services designed for happy, healthy pets.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {SERVICES.map((service) => (
            <ServiceCard key={service.title} service={service} navigate={navigate} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
