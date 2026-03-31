import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Home as HomeIcon, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-slate-100 -z-10" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-0 left-0 translate-y-1/3 -translate-x-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              Smart Student <span className="text-primary-600">Accommodation</span> Platform
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed">
              Find verified PGs, rental rooms, and mess services near your college. Compare distances, check facilities, and connect directly with owners.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/explore"
                className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <Search className="w-5 h-5 mr-2" />
                Explore Listings
              </Link>
              <Link
                to="/register"
                className="inline-flex justify-center items-center px-8 py-3.5 border-2 border-slate-200 text-base font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why choose Basera?</h2>
            <p className="mt-4 text-lg text-slate-600">We solve the biggest challenges in finding student housing</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">College Distance Search</h3>
              <p className="text-slate-600">Select your college and instantly see the exact distance and travel time to all nearby PGs and rooms.</p>
            </div>

            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Verified Listings</h3>
              <p className="text-slate-600">No more fake photos or outdated prices. Our admin team verifies listings to ensure platform authenticity.</p>
            </div>

            <div className="glass p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <HomeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Zero Brokerage</h3>
              <p className="text-slate-600">Connect directly with PG, room, and mess owners via Call or WhatsApp. Say goodbye to hefty broker fees.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
