import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OwnerDashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'RoomOwner') navigate('/owner/room-dashboard');
            else if (user.role === 'MessOwner') navigate('/owner/mess-dashboard');
            else navigate('/');
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
    );
};

export default OwnerDashboard;
