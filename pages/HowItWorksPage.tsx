
import React from 'react';
import type { Testimonial } from '../types';
import { TESTIMONIALS } from '../constants';
import { PawPrintIcon } from '../components/icons/PawPrintIcon';

const Step: React.FC<{ number: number; title: string; description: string }> = ({ number, title, description }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-orange-500 text-white flex items-center justify-center text-xl font-bold">
                {number}
            </div>
            <div className="w-px h-24 bg-brand-orange-200 mt-2"></div>
        </div>
        <div className="ml-6">
            <h3 className="text-xl font-bold text-brand-teal-800">{title}</h3>
            <p className="mt-2 text-gray-600">{description}</p>
        </div>
    </div>
);

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col h-full">
        <div className="flex mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            ))}
        </div>
        <p className="text-gray-600 italic flex-grow">"{testimonial.quote}"</p>
        <div className="mt-6 flex items-center">
            <img className="w-14 h-14 rounded-full object-cover" src={testimonial.avatarUrl} alt={testimonial.author} />
            <div className="ml-4">
                <p className="font-bold text-brand-teal-700">{testimonial.author}</p>
                <p className="text-sm text-gray-500">Owner of {testimonial.pet}</p>
            </div>
        </div>
    </div>
);


const HowItWorksPage: React.FC = () => {
    return (
        <>
            <section className="py-16 sm:py-24 bg-brand-orange-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-brand-teal-800">Getting Started is Easy</h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                            Join our community and find the perfect care for your pet in just a few simple steps.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <Step number={1} title="Sign Up & Create a Profile" description="Join for free and tell us about your pet. The more details, the better we can match you with the right services and community members."/>
                        <Step number={2} title="Choose Your Service" description="Browse our wide range of services—from hosting and feeding to training and events. Find exactly what you and your pet need."/>
                        <Step number={3} title="Connect & Book" description="Connect with trusted caregivers, trainers, or fellow pet owners. Read reviews, chat, and book with confidence."/>
                        <div className="flex items-start">
                             <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-brand-orange-500 text-white flex items-center justify-center text-xl font-bold">
                                    4
                                </div>
                             </div>
                             <div className="ml-6">
                                <h3 className="text-xl font-bold text-brand-teal-800">Relax & Enjoy!</h3>
                                <p className="mt-2 text-gray-600">With your pet in good hands, you can relax. Receive updates, photos, and enjoy the peace of mind that comes with PetPal.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="py-16 sm:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <PawPrintIcon className="w-12 h-12 mx-auto text-brand-orange-400 mb-4"/>
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-teal-800">Stories from Our Community</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                            Don't just take our word for it. Here's what our happy members are saying.
                        </p>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <TestimonialCard key={index} testimonial={testimonial} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default HowItWorksPage;
