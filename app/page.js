'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image"; // Added Image import
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen relative font-sans flex flex-col">
      {/* Global Background Image */}
      <div className="absolute inset-0 bg-[url('/img1.webp')] bg-cover bg-center -z-20 fixed"></div>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm -z-10 fixed"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300 font-montserrat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.webp"
                  alt="eWaste Logo"
                  fill
                  className="object-contain" // Use object-contain to keep aspect ratio
                  priority
                />
              </div>
              <span className="text-2xl font-bold text-green-700 font-oswald tracking-wide">
                eWaste
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 font-medium">
              {status === 'authenticated' ? (
                <>
                  {session?.user?.role === 'admin' && (
                    <>
                      <Link href="/add" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                        Add Location
                      </Link>
                      <Link href="/collect" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                        Collection Points
                      </Link>
                      <Link href="/complaints" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                        Manage Complaints
                      </Link>
                    </>
                  )}
                  {session?.user?.role === 'driver' && (
                    <>
                      <Link href="/collect" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                        Collection Points
                      </Link>
                      <Link href="/complaints" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                        My Dispatches
                      </Link>
                    </>
                  )}
                  {session?.user?.role === 'user' && (
                    <>
                      <Link href="/complaints/new" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                        Submit Complaint
                      </Link>
                      <Link href="/complaints" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                        My Complaints
                      </Link>
                    </>
                  )}
                  <div className="flex items-center gap-4 pl-4 border-l border-gray-300">
                    <span className="text-sm text-gray-700">Hi, <span className="font-semibold text-gray-900">{session?.user?.name || 'User'}</span></span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="px-4 py-2 rounded-full bg-red-100/80 text-red-700 hover:bg-red-200/80 font-medium transition-all text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/add" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                    Add Location
                  </Link>
                  <Link href="/collect" className="text-gray-800 hover:text-green-700 font-medium transition-colors">
                    Collection Points
                  </Link>
                  <Link href="/login" className="px-5 py-2.5 rounded-full bg-green-700 text-white font-medium hover:bg-green-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-800 hover:bg-white/50 transition-colors"
              onClick={toggleSidebar}
              aria-label="Toggle Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Full Page Sidebar */}
      <div className={`fixed inset-0 z-[60] transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={toggleSidebar}></div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 flex flex-col">
          <div className="flex justify-end mb-8">
            <button
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              onClick={toggleSidebar}
              aria-label="Close Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {status === 'authenticated' ? (
              <>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="font-semibold text-gray-900 text-lg">{session?.user?.name || 'User'}</p>
                </div>
                {session?.user?.role === 'admin' && (
                  <>
                    <Link href="/add" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                      Add Location
                    </Link>
                    <Link href="/collect" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                      Collection Points
                    </Link>
                    <Link href="/complaints" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                      Manage Complaints
                    </Link>
                  </>
                )}
                {session?.user?.role === 'driver' && (
                  <>
                    <Link href="/collect" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                      Collection Points
                    </Link>
                    <Link href="/complaints" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                      My Dispatches
                    </Link>
                  </>
                )}
                {session?.user?.role === 'user' && (
                  <>
                    <Link href="/complaints/new" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                      Submit Complaint
                    </Link>
                    <Link href="/complaints" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                      My Complaints
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    toggleSidebar();
                    signOut({ callbackUrl: '/' });
                  }}
                  className="mt-auto w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/add" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                  Add Location
                </Link>
                <Link href="/collect" className="text-xl font-medium text-gray-800 hover:text-green-600 transition-colors" onClick={toggleSidebar}>
                  Collection Points
                </Link>
                <Link href="/login" className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-center hover:bg-green-700 shadow-lg transition-transform active:scale-95" onClick={toggleSidebar}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center relative overflow-hidden pt-16">
        {/* Animated blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-300/30 rounded-full blur-3xl mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-4xl mx-auto px-4 text-center z-10 py-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/50 backdrop-blur border border-green-100 text-green-700 text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm font-montserrat">
            Sustainable Future
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-8 leading-tight font-raleway">
            A Smarter Way to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">Manage City Waste</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-montserrat">
            Join our mission to create cleaner, greener cities through efficient waste collection and smart geolocation monitoring systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {status === 'authenticated' ? (
              session?.user?.role === 'admin' ? (
                <>
                  <Link href="/add" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 hover:shadow-xl hover:bg-green-700 transition-all transform hover:-translate-y-1">
                    Register Location
                  </Link>
                  <Link href="/collect" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-gray-800 font-bold text-lg border border-gray-200 shadow-md hover:shadow-lg hover:border-green-200 hover:text-green-600 transition-all transform hover:-translate-y-1">
                    View Points
                  </Link>
                  <Link href="/complaints" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 text-white font-bold text-lg shadow-lg shadow-amber-200 hover:shadow-xl hover:bg-amber-600 transition-all transform hover:-translate-y-1">
                    Complaints
                  </Link>
                </>
              ) : session?.user?.role === 'user' ? (
                <>
                  <Link href="/complaints/new" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 hover:shadow-xl hover:bg-green-700 transition-all transform hover:-translate-y-1">
                    Submit Complaint
                  </Link>
                  <Link href="/complaints" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-gray-800 font-bold text-lg border border-gray-200 shadow-md hover:shadow-lg hover:border-green-200 hover:text-green-600 transition-all transform hover:-translate-y-1">
                    View My Complaints
                  </Link>
                </>
              ) : (
                <Link href="/collect" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 hover:shadow-xl hover:bg-green-700 transition-all transform hover:-translate-y-1">
                  View Collection Points
                </Link>
              )
            ) : (
              <>
                <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 hover:shadow-xl hover:bg-green-700 transition-all transform hover:-translate-y-1">
                  Get Started
                </Link>
                <Link href="/collect" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-gray-800 font-bold text-lg border border-gray-200 shadow-md hover:shadow-lg hover:border-green-200 hover:text-green-600 transition-all transform hover:-translate-y-1">
                  View Map
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
