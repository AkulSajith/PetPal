
import React from 'react';
import { PawPrintIcon } from './icons/PawPrintIcon';
import { SocialIcons } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-gray-600">
          <PawPrintIcon className="w-8 h-8 mx-auto text-brand-orange-300 mb-4" />
          <p className="italic text-lg">“Because every pet in India deserves love, care, and connection — anytime, anywhere.”</p>
        </div>
        <div className="flex justify-center my-8">
          <SocialIcons />
        </div>
        <div className="border-t border-brand-orange-100 pt-8 mt-8 text-center text-sm text-gray-500">
          <p>Contact: support@petpalindia.com | (022) 456-7890</p>
          <p className="mt-2">Copyright &copy; {new Date().getFullYear() > 2024 ? new Date().getFullYear() : 2025} PetPal India. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;