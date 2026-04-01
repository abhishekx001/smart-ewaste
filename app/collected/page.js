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
            <div className="min-h-screen flex items-center justify-center bg-appBg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonGreen"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-appBg px-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/10">
                    <h1 className="text-2xl font-bold text-textPrimary mb-4 text-center">Authentication <span className="text-warning">Required</span></h1>
                    <p className="text-textMuted text-center mb-6">
                        You must be logged in to view collected points.
                    </p>
                    <Link href="/login" className="block w-full py-3 px-4 bg-neonGreen text-black text-center font-bold rounded-xl hover:scale-105 hover:shadow-[0_0_20px_#00FF88] transition-all">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (session?.user?.role !== 'driver' && session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-appBg px-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-danger/30">
                    <h1 className="text-2xl font-bold text-danger mb-4 text-center">Access <span className="text-danger/80">Denied</span></h1>
                    <p className="text-textMuted text-center mb-6">
                        This page is restricted to Drivers and Admins only.
                    </p>
                    <Link href="/" className="block w-full py-3 px-4 bg-danger/20 text-danger border border-danger/30 text-center font-bold rounded-xl hover:bg-danger/30 transition-all">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-appBg font-sans text-textPrimary">
            <header className="bg-appBg border-b border-white/10 py-12 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-10 w-64 h-64 bg-neonGreen/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left relative z-10 animate-fade-in-up">
                    <h1 className="text-4xl font-extrabold text-textPrimary mb-2 tracking-tight">
                        Collected <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonGreen to-electricBlue">Bins</span>
                    </h1>
                    <p className="text-lg text-textMuted max-w-2xl">
                        {session.user.role === 'admin' ? 'View all bins that have been successfully collected by drivers.' : 'View history of bins you have collected.'}
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonGreen mb-4"></div>
                        <p className="text-textMuted">Loading collected bins...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-danger/10 rounded-2xl border border-danger/30">
                        <p className="text-danger font-semibold">{error}</p>
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 text-neonGreen">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <p className="text-xl text-textMuted font-medium">No collected bins found.</p>
                        <p className="text-textMuted/70 mt-2">Completed pickups will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {locations.map((item) => (
                            <div key={item._id} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden group flex flex-col h-full hover:border-neonGreen/30 transition-all duration-300">
                                <div className="p-6 flex-grow relative">
                                    <div className="absolute top-4 right-4 bg-neonGreen/10 border border-neonGreen/30 text-neonGreen px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-neonGreen animate-pulse"></div>
                                        Collected
                                    </div>
                                    <div className="flex items-start justify-between mb-4 mt-2">
                                        <div className="bg-white/5 p-2 rounded-xl text-textMuted border border-white/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-textPrimary mb-2 line-clamp-2" title={item.address}>{item.address}</h3>
                                    <p className="text-textMuted text-sm mb-4">{item.city} - {item.pincode}</p>
                                    
                                    {item.assigned_driver && session?.user?.role === 'admin' && (
                                        <p className="text-sm font-bold text-neonGreen bg-neonGreen/10 inline-block px-3 py-1 rounded-xl border border-neonGreen/30">Collected by: {item.assigned_driver}</p>
                                    )}
                                </div>
                                
                                <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex flex-wrap gap-2 mt-auto">
                                    <Link
                                        href={item.geolocation.latitude && item.geolocation.longitude ? `https://www.google.com/maps/search/?api=1&query=${item.geolocation.latitude},${item.geolocation.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.address}, ${item.city}, ${item.pincode}`)}`}
                                        target="_blank"
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-black/30 border border-electricBlue/40 text-electricBlue font-medium hover:bg-electricBlue/10 transition-all text-sm shadow-sm"
                                    >
                                        <span>View Map</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
