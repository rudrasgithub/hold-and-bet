'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.success('Your message has been sent successfully!');

    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  return (
    <div className="bg-gray-800 text-white min-h-screen rounded-md">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-purple-400 mb-5">Contact Us</h2>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-3xl font-semibold text-center text-blue-400 mb-2">Send Us a Message</h3>

            <form onSubmit={handleSubmit} className="">
              <div>
                <label htmlFor="name" className="block text-lg font-medium text-white">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 mt-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-lg font-medium text-white">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 mt-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-lg font-medium text-white">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full p-4 mt-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-md shadow-md transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-3xl font-semibold text-center text-blue-400 mb-3">Our Contact Information</h3>
            <p className="text-lg mb-2">
              <strong>Address:</strong> Konaphalam, Repalle, AndhraPradesh, India, 522262
            </p>
            <p className="text-lg mb-2">
              <strong>Name:</strong> Pasupuleti Rudrama Naidu
            </p>
            <p className="text-lg mb-2">
              <strong>Email:</strong> rudramanaidu99@gmail.com
            </p>
            <p className="text-lg mb-2">
              <strong>Phone:</strong> +91 9347253187
            </p>
            <p className="text-lg">
              <strong>Business Hours:</strong> Mon - Sun, 00:00 AM - 11:59 PM
            </p>

            {/* Map Section */}
            <div className="mt-2">
              <h4 className="text-xl text-center text-purple-400 mb-4">Find Us on the Map</h4>
              <div className="relative pt-[56.25%]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387968.0606489069!2d80.26728899145349!3d16.00877400000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a30f46a6bde5b61%3A0x1fc8e2c9608f2320!2sKonaphalam%2C%20Repalle%2C%20Andhra%20Pradesh%2C%20India%2C%20522262!5e0!3m2!1sen!2sus!4v1677722689176!5m2!1sen!2sus"
                  width="100%"
                  height="450"
                  className="absolute top-0 left-0 w-full h-full rounded-xl"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
