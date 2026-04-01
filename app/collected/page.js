'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MapPin, CheckCircle, ExternalLink, ChevronLeft, LayoutPanelLeft, Clock } from 'lucide-react';

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
                    if (!res.ok) throw new Error('failed to fetch data');
                    const data = await res.json();
                    setLocations(data.locations || []);
                } catch (err) {
                    setError('failed to load collected points');
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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full bg-surface p-10 rounded-lg border border-borderColor text-center">
                    <LayoutPanelLeft className="w-12 h-12 text-warning mx-auto mb-6" />
                    <h1 className="text-xl font-semibold mb-2">authentication required</h1>
                    <p className="text-sm text-textMuted mb-8">you must be logged in to view collected points.</p>
                    <Link href="/login" className="btn-primary inline-block w-full text-center">go to login</Link>
                </div>
            </div>
        );
    }

    if (session?.user?.role !== 'driver' && session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full bg-red-50 p-10 rounded-lg border border-red-100 text-center">
                    <LayoutPanelLeft className="w-12 h-12 text-danger mx-auto mb-6" />
                    <h1 className="text-xl font-semibold text-danger mb-2">access denied</h1>
                    <p className="text-sm text-red-600/70 mb-8">this page is restricted to drivers and admins only.</p>
                    <Link href="/" className="btn-secondary inline-block w-full text-center">return home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-poppins text-textPrimary selection:bg-primary/10 pb-20">
            {/* Header */}
            <header className="border-b border-borderColor bg-white py-12 px-6 mb-12">
                <div className="max-w-[1280px] mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-textMuted hover:text-primary transition-colors mb-4 italic">
                        <ChevronLeft className="w-3 h-3" /> back to home
                    </Link>
                    <h1 className="text-3xl font-semibold tracking-tight uppercase italic text-secondary">collected history</h1>
                    <p className="text-sm text-textMuted mt-1">
                        {session.user.role === 'admin' ? 'audit trail of all successfully processed bin collections.' : 'your personal history of completed collections.'}
                    </p>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-6">
                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-dashed border-borderColor rounded-lg">
                        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm text-textMuted italic">loading history...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-danger font-medium text-sm">{error}</p>
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-32 bg-surface rounded-lg border border-borderColor border-dashed">
                        <Clock className="w-12 h-12 text-textMuted mx-auto mb-6 opacity-20" />
                        <p className="text-lg font-medium text-textMuted">no records found.</p>
                        <p className="text-xs text-textMuted mt-1 italic uppercase tracking-widest">completed pickups will appear here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {locations.map((item) => (
                            <div key={item._id} className="bg-surface border border-borderColor rounded-lg overflow-hidden flex flex-col hover:bg-white transition-all duration-150">
                                <div className="p-8 flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-green-50 border border-green-100 rounded flex items-center justify-center text-secondary">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div className="badge-empty flex items-center gap-1.5 border-none bg-green-100/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                                            collected
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-textPrimary mb-2 leading-snug">{item.address}</h3>
                                    <p className="text-sm text-textMuted mb-6 italic">{item.city} - {item.pincode}</p>
                                    
                                    {item.assigned_driver && session?.user?.role === 'admin' && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-borderColor rounded text-[10px] font-medium text-primary uppercase tracking-wider">
                                            driver: {item.assigned_driver}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-white border-t border-borderColor">
                                    <Link
                                        href={item.geolocation.latitude && item.geolocation.longitude ? `https://www.google.com/maps/search/?api=1&query=${item.geolocation.latitude},${item.geolocation.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.address}, ${item.city}, ${item.pincode}`)}`}
                                        target="_blank"
                                        className="btn-secondary w-full flex items-center justify-center gap-2 text-xs py-2.5"
                                    >
                                        <span>view site map</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-primary pt-24 pb-16 mt-20">
                <div className="max-w-[1280px] mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-secondary" />
                            <span className="text-xl font-semibold text-white tracking-tight italic">EcoTrack</span>
                        </div>
                        <div className="flex items-center gap-10">
                            <Link href="/" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-medium">home</Link>
                            <Link href="/collect" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-medium">bins map</Link>
                            <Link href="/complaints" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-medium">complaints</Link>
                        </div>
                        <div className="text-xs text-secondary font-medium italic">
                            &copy; 2026. all rights reserved.
                        </div>
                    </div>
                    <div className="flex justify-center pt-12 border-t border-white/10">
                        <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase font-bold">built for smart city waste logistics</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
