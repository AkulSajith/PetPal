
import React from 'react';
import type { CommunityPost } from '../types';
import { COMMUNITY_POSTS } from '../constants';

const CommunityPostCard: React.FC<{ post: CommunityPost }> = ({ post }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex items-center mb-4">
            <img className="w-12 h-12 rounded-full object-cover" src={post.avatarUrl} alt={post.author} />
            <div className="ml-4">
                <p className="font-bold text-brand-teal-800">{post.author}</p>
                <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
        </div>
        <p className="text-gray-700 mb-4 flex-grow">{post.content}</p>
        {post.imageUrl && (
            <img className="rounded-lg w-full h-auto object-cover mb-4" src={post.imageUrl} alt="Community post" />
        )}
        <div className="flex items-center text-gray-500 space-x-6 text-sm">
            <button className="flex items-center space-x-1 hover:text-brand-orange-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                <span>Like</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-brand-orange-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span>Comment</span>
            </button>
        </div>
    </div>
);

const CommunityPage: React.FC = () => {
  return (
    <div className="py-16 sm:py-24 bg-brand-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-teal-800">Welcome to the Neighborhood</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Share stories, ask for advice, and connect with other pet lovers near you.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Feed */}
            <div className="lg:col-span-2 space-y-8">
                {COMMUNITY_POSTS.map((post, index) => (
                    <CommunityPostCard key={index} post={post} />
                ))}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-brand-teal-800 mb-4">Upcoming Events</h3>
                    <ul className="space-y-4 text-gray-600">
                        <li className="flex items-start space-x-3">
                            <div className="p-1 bg-brand-orange-100 rounded-md mt-1"><svg className="w-4 h-4 text-brand-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                            <div>
                                <p className="font-semibold">Doggy Dash 5k</p>
                                <p className="text-sm">Sat, Oct 28, 9:00 AM</p>
                            </div>
                        </li>
                        <li className="flex items-start space-x-3">
                            <div className="p-1 bg-brand-orange-100 rounded-md mt-1"><svg className="w-4 h-4 text-brand-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
                            <div>
                                <p className="font-semibold">City Park Meetup</p>
                                <p className="text-sm">Sun, Oct 29, 2:00 PM</p>
                            </div>
                        </li>
                    </ul>
                </div>
                 <div className="bg-white rounded-2xl shadow-lg h-80">
                    <img src="https://picsum.photos/seed/map/600/400" alt="Map of nearby events" className="w-full h-full object-cover rounded-2xl" />
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
