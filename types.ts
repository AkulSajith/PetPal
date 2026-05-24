// Fix: Import React to make its types available for use in this file.
import React from 'react';

export type Page = 'home' | 'services' | 'how-it-works' | 'community' | 'about' | 'contact' | 'hosting' | 'food' | 'training' | 'vets' | 'events' | 'playdates' | 'adoption' | 'login' | 'signup' | 'dashboard' | 'profile' | 'admin-analytics';

export interface User {
  name: string;
  email: string;
  password?: string;
  city: string;
  petType: 'Dog' | 'Cat' | 'Other';
}

export interface Service {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  pageLink: Page;
}

export interface Testimonial {
  quote: string;
  author: string;
  pet: string;
  rating: number;
  avatarUrl: string;
}

export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
}

export interface CommunityPost {
  author: string;
  avatarUrl: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

export interface Host {
  id: number;
  name: string;
  location: string;
  pricePerDayInr: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
}

export interface Trainer {
  id: number;
  name: string;
  specialties: string[];
  rating: number;
  pricePerSessionInr: number;
  imageUrl: string;
}

export interface CommunityEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description: string;
}

export interface PlaydateProfile {
  id: number;
  name: string;
  age: number;
  breed: string;
  temperament: string;
  imageUrl: string;
  location: string;
}

export interface AdoptablePet {
  id: number;
  name: string;
  age: string;
  breed: string;
  gender: 'Male' | 'Female';
  imageUrl: string;
  shelter: string;
  adoptionFeeInr: number;
}