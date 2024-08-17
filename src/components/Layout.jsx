import React from 'react';
import dynamic from 'next/dynamic';

const NavBar = dynamic(() => import('./NavBar'), { ssr: false });

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;