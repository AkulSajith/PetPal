
import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  return (
    <div className="py-16 sm:py-24 bg-brand-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-teal-800">Get in Touch</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Have questions, feedback, or just want to say hi? We'd love to hear from you!
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                {isSubmitted ? (
                    <div className="text-center flex flex-col items-center justify-center h-full">
                        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 className="text-2xl font-bold text-brand-teal-800">Thank You!</h3>
                        <p className="mt-2 text-gray-600">Your message has been sent. We'll get back to you shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500"/>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea name="message" id="message" rows={5} required value={formData.message} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500"></textarea>
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-semibold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 transition-colors duration-300">
                                Send Message
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <div className="space-y-8">
                 <div className="bg-brand-teal-50 p-8 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-brand-teal-800 mb-4">Quick Links</h3>
                     <ul className="space-y-3">
                         <li><a href="#" className="text-brand-orange-600 hover:underline">Frequently Asked Questions</a></li>
                         <li><a href="#" className="text-brand-orange-600 hover:underline">Trust & Safety Guide</a></li>
                         <li><a href="#" className="text-brand-orange-600 hover:underline">Community Guidelines</a></li>
                     </ul>
                 </div>
                 <div className="bg-red-50 p-8 rounded-2xl shadow-lg">
                     <h3 className="text-xl font-bold text-red-800 mb-4">Emergency Contact</h3>
                     <p className="text-red-700">If your pet is experiencing a medical emergency, please contact your local veterinarian or an emergency pet hospital immediately.</p>
                     <p className="mt-4 font-bold text-red-800">ASPCA Poison Control: <a href="tel:888-426-4435" className="hover:underline">(888) 426-4435</a></p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
