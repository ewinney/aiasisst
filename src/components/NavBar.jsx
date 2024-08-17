import React from 'react';
import Link from 'next/link';

const NavBar = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">AI Assistant</Link>
        <div className="flex items-center space-x-4">
          <Link href="/notes" className="hover:text-gray-300">Notes</Link>
          <Link href="/projects" className="hover:text-gray-300">Projects</Link>
          <Link href="/tasks" className="hover:text-gray-300">Tasks</Link>
          <Link href="/tools" className="hover:text-gray-300">Tools</Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;