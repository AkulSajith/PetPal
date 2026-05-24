
import React from 'react';
import type { TeamMember } from '../types';
import { TEAM_MEMBERS } from '../constants';
import { PawPrintIcon } from '../components/icons/PawPrintIcon';

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
    <div className="text-center group">
        <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-300">
            <img className="w-full h-full object-cover" src={member.imageUrl} alt={member.name} />
        </div>
        <h3 className="mt-6 text-xl font-bold text-brand-teal-800">{member.name}</h3>
        <p className="text-brand-orange-600">{member.role}</p>
    </div>
);

const AboutUsPage: React.FC = () => {
    return (
        <>
            <section className="py-16 sm:py-24 bg-brand-teal-600 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <PawPrintIcon className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold">Our Mission</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl italic leading-relaxed">
                        “Making pet care smarter, simpler, and more social.”
                    </p>
                </div>
            </section>
            
            <section className="py-16 sm:py-24 bg-brand-orange-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-teal-800">Meet the PetPal Team</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                            We're a passionate group of pet lovers, tech enthusiasts, and community builders dedicated to making a difference.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {/* A bit of a hack to center the 7th member on the last row for larger screens */}
                        {TEAM_MEMBERS.map((member, index) => (
                           <div key={member.name} className={index === 6 ? 'col-start-2 md:col-start-auto lg:col-start-2' : ''}>
                               <TeamMemberCard member={member} />
                           </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutUsPage;
