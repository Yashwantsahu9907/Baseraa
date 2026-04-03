import React from 'react';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <ChatWindow />
      {/* Footer can be added here later */}
    </div>
  );
};

export default MainLayout;
