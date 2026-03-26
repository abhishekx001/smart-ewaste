'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CollectPage() {
    const { data: session, status } = useSession();
    const [locations, setLocations] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        try {
            const res = await fetch('/api/location', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                setLocations(prev => prev.filter(item => item._id !== id));
            } else {
                alert('Failed to delete location');
            }
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('An error occurred while deleting');
        }
    };

    const handleAccept = async (id) => {
        try {
            const res = await fetch('/api/location', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, assigned_driver: session.user.name }),
            });

            if (res.ok) {
                setLocations(prev => prev.map(item => item._id === id ? { ...item, assigned_driver: session.user.name } : item));
            } else {
                alert('Failed to accept location');
            }
        } catch (error) {
            console.error('Error accepting location:', error);
            alert('An error occurred while accepting');
        }
    };

    const handleMarkCollected = async (id) => {
        if (!confirm('Are you sure you want to mark this location as collected?')) return;
        try {
            const res = await fetch('/api/location', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: 'collected' }),
            });

            if (res.ok) {
                // Remove from the list as it is now collected
                setLocations(prev => prev.filter(item => item._id !== id));
            } else {
                alert('Failed to mark location as collected');
            }
        } catch (error) {
            console.error('Error updating location status:', error);
            alert('An error occurred while updating status');
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && (session?.user?.role === 'driver' || session?.user?.role === 'admin')) {
            const fetchLocations = async () => {
                try {
                    const params = new URLSearchParams({
                        role: session.user.role,
                        userId: session.user.name,
                        status: 'pending'
                    });
                    const res = await fetch(`/api/location?${params.toString()}`);
                    if (!res.ok) throw new Error('Failed to fetch data');
                    const data = await res.json();
                    setLocations(data.locations || []);
                } catch (err) {
                    setError('Failed to load collection points');
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
                        You must be logged in as a driver to view collection points.
                    </p>
                    <Link href="/login" className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-center font-bold rounded-xl transition-colors shadow-md">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Role check: Only drivers and admins can access this page
    if (session?.user?.role !== 'driver' && session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500">
                    <h1 className="text-2xl font-bold text-red-600 mb-4 text-center">Access <span className="text-red-800">Denied</span></h1>
                    <p className="text-gray-600 text-center mb-6">
                        This page is restricted to Drivers and Admins only. <br />
                        It seems this is not your purpose.
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
                        Collection <span className="text-green-600">Points</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl">List of locations scheduled for pickup today. Optimize your route efficiently.</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <p className="text-gray-500">Loading collection points...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-red-500 font-semibold">{error}</p>
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </div>
                        <p className="text-xl text-gray-500 font-medium">No collection points found.</p>
                        <p className="text-gray-400 mt-2">Check back later or register a new location.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {locations.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
                                <div className="p-6 flex-grow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-green-50 p-2 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{item.pincode}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2" title={item.address}>{item.address}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{item.city}</p>
                                    
                                    {item.assigned_driver && session?.user?.role === 'admin' && (
                                        <p className="text-xs font-bold text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded">Assigned to: {item.assigned_driver}</p>
                                    )}
                                </div>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                                    <Link
                                        href={`https://www.google.com/maps/search/?api=1&query=${item.geolocation.latitude},${item.geolocation.longitude}`}
                                        target="_blank"
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-sm shadow-sm"
                                    >
                                        <span>Map</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </Link>

                                    {session?.user?.role === 'driver' && (
                                        item.assigned_driver === session.user.name ? (
                                            <button
                                                onClick={() => handleMarkCollected(item._id)}
                                                className="flex-1 py-1 px-3 rounded-lg font-bold text-sm bg-green-600 text-white hover:bg-green-700 shadow-sm transition-colors text-center"
                                                title="Mark this location as collected"
                                            >
                                                Mark as Collected
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAccept(item._id)}
                                                disabled={!!item.assigned_driver}
                                                className={`flex-1 py-1 px-3 rounded-lg font-bold text-sm transition-colors ${item.assigned_driver ? 'bg-gray-400 text-white cursor-not-allowed opacity-80' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
                                                title={item.assigned_driver ? "Already accepted" : "Accept this location"}
                                            >
                                                {item.assigned_driver ? 'Taken' : 'Accept'}
                                            </button>
                                        )
                                    )}

                                    {session?.user?.role === 'admin' && (
                                        <>
                                            <Link
                                                href={`/add?edit=true&id=${item._id}&street=${encodeURIComponent(item.address)}&city=${encodeURIComponent(item.city)}&pincode=${item.pincode}&lat=${item.geolocation.latitude}&lng=${item.geolocation.longitude}`}
                                                className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </Link>
                                            <button
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                                                onClick={() => handleDelete(item._id)}
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </>
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
