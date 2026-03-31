import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Lock, Phone, User as UserIcon, Building2, Utensils } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Student'
  });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl shadow-xl z-10 animate-fade-in relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/2 w-48 h-48 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100">
            <UserPlus className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'Student', icon: UserIcon },
                { type: 'RoomOwner', icon: Building2 },
                { type: 'MessOwner', icon: Utensils },
              ].map((role) => (
                <label
                  key={role.type}
                  className={`cursor-pointer flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
                    formData.role === role.type
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.type}
                    checked={formData.role === role.type}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <role.icon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium text-center">{role.type}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-md hover:shadow-lg transition-all"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
