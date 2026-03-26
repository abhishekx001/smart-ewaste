'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CollectedPage() {
    const { data: session, status } = useSession();
    const [locations, setLocations] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && (session?.user?.role === 'driver' || session?.user?.role === 'admin')) {
            const fetchLocations = async () => {
                try {
                    const params = new URLSearchParams({
                        role: session.user.role,
                        userId: session.user.name,
                        status: 'collected'
                    });
                    const res = await fetch(`/api/location?${params.toString()}`);
                    if (!res.ok) throw new Error('Failed to fetch data');
                    const data = await res.json();
                    setLocations(data.locations || []);
                } catch (err) {
                    setError('Failed to load collected points');
                    console.error(err);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchLocations();
        } else if (status !== 'loading') {
            setLoadingData(false);
        }
    }, [status, session]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-yellow-500">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Authentication <span className="text-yellow-600">Required</span></h1>
                    <p className="text-gray-600 text-center mb-6">
                        You must be logged in to view collected points.
                    </p>
                    <Link href="/login" className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-center font-bold rounded-xl transition-colors shadow-md">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (session?.user?.role !== 'driver' && session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500">
                    <h1 className="text-2xl font-bold text-red-600 mb-4 text-center">Access <span className="text-red-800">Denied</span></h1>
                    <p className="text-gray-600 text-center mb-6">
                        This page is restricted to Drivers and Admins only.
                    </p>
                    <Link href="/" className="block w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-center font-bold rounded-xl transition-colors shadow-md">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white border-b border-gray-200 py-12 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        Collected <span className="text-green-600">Bins</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        {session.user.role === 'admin' ? 'View all bins that have been successfully collected by drivers.' : 'View history of bins you have collected.'}
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <p className="text-gray-500">Loading collected bins...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-red-500 font-semibold">{error}</p>
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4 text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <p className="text-xl text-gray-500 font-medium">No collected bins found.</p>
                        <p className="text-gray-400 mt-2">Completed pickups will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {locations.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full opacity-80">
                                <div className="p-6 flex-grow relative">
                                    <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Collected
                                    </div>
                                    <div className="flex items-start justify-between mb-4 mt-2">
                                        <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={item.address}>{item.address}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{item.city} - {item.pincode}</p>
                                    
                                    {item.assigned_driver && session?.user?.role === 'admin' && (
                                        <p className="text-sm font-bold text-green-700 bg-green-50 inline-block px-3 py-1 rounded-lg border border-green-200">Collected by: {item.assigned_driver}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
