'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
    MapPin, 
    CheckCircle, 
    ExternalLink, 
    Trash2, 
    Edit2, 
    AlertCircle, 
    ChevronLeft, 
    Menu, 
    X, 
    Trash, 
    ShieldCheck, 
    History 
} from 'lucide-react';
import Image from 'next/image';

export default function CollectPage() {
    const { data: session, status } = useSession();
    const [locations, setLocations] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleDelete = async (id) => {
        if (!confirm('are you sure you want to delete this location?')) return;
        try {
            const res = await fetch('/api/location', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setLocations(prev => prev.filter(item => item._id !== id));
            } else {
                alert('failed to delete location');
            }
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('an error occurred while deleting');
        }
    };

    const handleAccept = async (id) => {
        try {
            const res = await fetch('/api/location', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, assigned_driver: session.user.name }),
            });
            if (res.ok) {
                setLocations(prev => prev.map(item => item._id === id ? { ...item, assigned_driver: session.user.name } : item));
            } else {
                alert('failed to accept location');
            }
        } catch (error) {
            console.error('Error accepting location:', error);
            alert('an error occurred while accepting');
        }
    };

    const handleMarkCollected = async (id) => {
        if (!confirm('are you sure you want to mark this location as collected?')) return;
        try {
            const res = await fetch('/api/location', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'collected' }),
            });
            if (res.ok) {
                setLocations(prev => prev.filter(item => item._id !== id));
            } else {
                alert('failed to mark location as collected');
            }
        } catch (error) {
            console.error('Error updating location status:', error);
            alert('an error occurred while updating status');
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
                    if (!res.ok) throw new Error('failed to fetch data');
                    const data = await res.json();
                    setLocations(data.locations || []);
                } catch (err) {
                    setError('failed to load collection points');
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
                    <AlertCircle className="w-12 h-12 text-warning mx-auto mb-6" />
                    <h1 className="text-xl font-semibold mb-2">authentication required</h1>
                    <p className="text-sm text-textMuted mb-8">you must be logged in as a driver to view collection points.</p>
                    <Link href="/login" className="btn-primary inline-block w-full text-center">go to login</Link>
                </div>
            </div>
        );
    }

    if (session?.user?.role !== 'driver' && session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full bg-red-50 p-10 rounded-lg border border-red-100 text-center">
                    <AlertCircle className="w-12 h-12 text-danger mx-auto mb-6" />
                    <h1 className="text-xl font-semibold text-danger mb-2">access denied</h1>
                    <p className="text-sm text-red-600/70 mb-8">this page is restricted to drivers and admins only.</p>
                    <Link href="/" className="btn-secondary inline-block w-full text-center">return home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-poppins text-textPrimary selection:bg-primary/10">
            {/* Global Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-borderColor">
                <div className="max-w-[1280px] mx-auto px-6 h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <Trash className="w-5 h-5 text-primary" />
                        <span className="text-xl font-semibold text-textPrimary tracking-tight italic">EcoTrack</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-textMuted hover:text-primary transition-colors italic">Home</Link>
                        <Link href="/collect" className="text-sm font-semibold text-primary italic px-3 py-1 bg-primary/5 rounded">Live Map</Link>
                        <Link href="/complaints" className="text-sm font-medium text-textMuted hover:text-primary transition-colors italic">Complaints</Link>
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="text-xs font-bold text-danger italic pl-6 border-l border-borderColor">Logout</button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="lg:hidden w-10 h-10 flex items-center justify-center bg-surface border border-borderColor rounded-lg text-textPrimary hover:bg-white transition-all active:scale-95" 
                        onClick={toggleSidebar}
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Header */}
            <header className="pt-32 pb-12 px-6 mb-12 bg-white">
                <div className="max-w-[1280px] mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-textMuted hover:text-primary transition-colors mb-6 uppercase tracking-widest italic">
                        <ChevronLeft className="w-3 h-3" /> system overview
                    </Link>
                    <h1 className="text-3xl font-semibold tracking-tight uppercase italic flex items-center gap-4">
                        <MapPin className="text-primary w-8 h-8" /> collection network
                    </h1>
                    <p className="text-sm text-textMuted mt-1">optimize bin retrieval routes across the metropolitan sector</p>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 pb-24">
                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-dashed border-borderColor rounded-lg">
                        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm text-textMuted italic">fetching points...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-danger font-medium text-sm">{error}</p>
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-32 bg-surface rounded-lg border border-borderColor border-dashed">
                        <MapPin className="w-12 h-12 text-textMuted mx-auto mb-6 opacity-20" />
                        <p className="text-lg font-medium text-textMuted">no collection points found.</p>
                        <p className="text-xs text-textMuted mt-1 italic uppercase tracking-widest">check back later or register a new site</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {locations.map((item) => (
                            <div key={item._id} className="bg-surface border border-borderColor rounded-lg overflow-hidden flex flex-col hover:bg-white transition-all duration-150 group">
                                <div className="p-8 flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-white border border-borderColor rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest bg-white border border-borderColor px-2 py-1 rounded">
                                            {item.pincode}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-textPrimary mb-2 leading-snug">{item.address}</h3>
                                    <p className="text-sm text-textMuted mb-6 italic">{item.city}</p>
                                    
                                    {item.assigned_driver && session?.user?.role === 'admin' && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-borderColor rounded text-[10px] font-bold text-secondary uppercase tracking-wider italic">
                                            assigned: {item.assigned_driver}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-white border-t border-borderColor flex flex-wrap gap-3">
                                    <Link
                                        href={item.geolocation.latitude && item.geolocation.longitude ? `https://www.google.com/maps/search/?api=1&query=${item.geolocation.latitude},${item.geolocation.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.address}, ${item.city}, ${item.pincode}`)}`}
                                        target="_blank"
                                        className="btn-secondary flex-1 flex items-center justify-center gap-2 text-xs py-2.5 italic border-secondary/20"
                                    >
                                        <span>open map</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>

                                    {session?.user?.role === 'driver' && (
                                        item.assigned_driver === session.user.name ? (
                                            <button
                                                onClick={() => handleMarkCollected(item._id)}
                                                className="btn-primary flex-1 py-1 px-3 text-xs italic"
                                                title="Mark this location as collected"
                                            >
                                                confirm collection
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAccept(item._id)}
                                                disabled={!!item.assigned_driver}
                                                className={`flex-1 py-1 px-3 rounded-lg font-bold text-xs transition-all uppercase tracking-widest italic ${item.assigned_driver ? 'bg-surface text-textMuted cursor-not-allowed border border-borderColor' : 'btn-primary'}`}
                                            >
                                                {item.assigned_driver ? 'taken' : 'reserve pickup'}
                                            </button>
                                        )
                                    )}

                                    {session?.user?.role === 'admin' && (
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/add?edit=true&id=${item._id}&street=${encodeURIComponent(item.address)}&city=${encodeURIComponent(item.city)}&pincode=${item.pincode}&lat=${item.geolocation.latitude}&lng=${item.geolocation.longitude}`}
                                                className="p-2.5 rounded-lg border border-borderColor hover:bg-surface transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4 text-textMuted" />
                                            </Link>
                                            <button
                                                className="p-2.5 rounded-lg border border-red-50 hover:bg-red-50 transition-colors"
                                                onClick={() => handleDelete(item._id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-danger" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-primary pt-24 pb-16">
                <div className="max-w-[1280px] mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
                        <div className="flex items-center gap-3">
                            <Trash className="w-5 h-5 text-secondary" />
                            <span className="text-xl font-semibold text-white tracking-tight italic">EcoTrack</span>
                        </div>
                        <div className="flex items-center gap-10">
                            <Link href="/" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-bold">home</Link>
                            <Link href="/collect" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-bold">bins map</Link>
                            <Link href="/complaints" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-bold">complaints</Link>
                        </div>
                        <div className="text-xs text-secondary font-bold uppercase tracking-widest italic">
                            &copy; 2026 eco systems
                        </div>
                    </div>
                    <div className="flex justify-center pt-12 border-t border-white/10">
                        <p className="text-[10px] text-white/30 tracking-[0.4em] uppercase font-bold">mission: clean city logistics</p>
                    </div>
                </div>
            </footer>

            {/* Mobile Sidebar */}
            <div 
                className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
                {/* Backdrop overlay */}
                <div 
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    onClick={toggleSidebar}
                ></div>
                
                {/* Sliding Panel */}
                <div 
                    className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-8 shadow-2xl transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex justify-between items-center mb-12">
                        <Link href="/" className="flex items-center gap-2" onClick={toggleSidebar}>
                            <Trash className="w-5 h-5 text-primary" />
                            <span className="text-xl font-semibold text-textPrimary tracking-tight italic">EcoTrack</span>
                        </Link>
                        <button 
                            onClick={toggleSidebar} 
                            className="w-10 h-10 flex items-center justify-center bg-surface border border-borderColor rounded-lg text-textPrimary"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-12">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic mb-1">operator</p>
                            <p className="text-2xl font-semibold text-textPrimary leading-none">{session?.user?.name}</p>
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/10 rounded mt-4">
                                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{session?.user?.role} portal</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 flex-grow overflow-y-auto pr-2 pb-8">
                        <Link href="/" className="group" onClick={toggleSidebar}>
                            <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">Home</span>
                            <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-bold italic">general overview</p>
                        </Link>
                        <Link href="/collect" className="group" onClick={toggleSidebar}>
                            <span className="text-3xl font-semibold text-primary italic leading-none">Live Map</span>
                            <p className="text-[10px] text-primary/50 mt-1 uppercase tracking-widest font-bold italic">real-time routing</p>
                        </Link>
                        <Link href="/complaints" className="group" onClick={toggleSidebar}>
                            <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">Complaints</span>
                            <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-bold italic">incident logs</p>
                        </Link>
                        <Link href="/collected" className="group" onClick={toggleSidebar}>
                            <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">History</span>
                            <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-bold italic">audit archives</p>
                        </Link>
                        
                        <button 
                            onClick={() => { signOut({ callbackUrl: '/' }); toggleSidebar(); }}
                            className="text-left mt-4"
                        >
                            <span className="text-2xl font-bold text-danger italic">Logout</span>
                        </button>
                    </div>

                    <div className="absolute bottom-10 left-8 right-8 pt-10 border-t border-borderColor">
                        <div className="flex justify-between items-center bg-surface p-6 rounded-lg border border-borderColor">
                            <div>
                                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1">status</p>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
                                    NETWORK SECURE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
