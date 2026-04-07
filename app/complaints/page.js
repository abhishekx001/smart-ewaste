'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    Trash2, 
    User, 
    MapPin, 
    ShieldCheck, 
    ChevronLeft, 
    Menu, 
    X, 
    Trash, 
    Truck,
    Settings2
} from "lucide-react";
import Image from "next/image";

export default function ComplaintsPage() {
    const { data: session, status } = useSession();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drivers, setDrivers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        if (status === 'authenticated' && ['user', 'admin', 'driver'].includes(session?.user?.role)) {
            const fetchComplaints = async () => {
                let url = `/api/complaints?userId=${session.user.name}&role=${session.user.role}`;
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    setComplaints(data.complaints || []);
                } catch (err) {
                    console.error("Fetch complaints error:", err);
                } finally {
                    setLoading(false);
                }
            };

            const fetchDrivers = async () => {
                if (session.user.role === 'admin') {
                    try {
                        const res = await fetch('/api/drivers');
                        const data = await res.json();
                        setDrivers(data.drivers || []);
                    } catch (err) {
                        console.error("Fetch drivers error:", err);
                    }
                }
            };

            fetchComplaints();
            fetchDrivers();
        } else if (status !== 'loading') {
            setLoading(false);
        }
    }, [status, session]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await fetch('/api/complaints', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (res.ok) {
                setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
            }
        } catch (err) {
            console.error("Update status error:", err);
        }
    };

    const handleAssignDriver = async (id, driverName) => {
        try {
            const res = await fetch('/api/complaints', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, assigned_driver: driverName }),
            });
            if (res.ok) {
                setComplaints(complaints.map(c => c._id === id ? { ...c, assigned_driver: driverName } : c));
            }
        } catch (err) {
            console.error("Assign driver error:", err);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'resolved': return 'bg-secondary/10 text-secondary border-secondary/30';
            case 'in-progress': return 'bg-primary/5 text-primary border-primary/20';
            case 'driver-completed': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-warning/5 text-warning border-warning/20';
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (status === 'unauthenticated' || !['user', 'admin', 'driver'].includes(session?.user?.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full bg-surface p-10 rounded-lg border border-borderColor text-center">
                    <AlertCircle className="w-12 h-12 text-warning mx-auto mb-6" />
                    <h1 className="text-xl font-semibold mb-2">Access Restricted</h1>
                    <p className="text-sm text-textMuted mb-8">Please sign in to view incident logs.</p>
                    <Link href="/login" className="btn-primary inline-block w-full text-center">Login</Link>
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
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-borderColor/50">
                            <Image src="/logo main.jpg" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="text-xl font-semibold text-textPrimary tracking-tight italic">EcoTrack</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-textMuted hover:text-primary transition-colors italic">Home</Link>
                        <Link href="/collect" className="text-sm font-medium text-textMuted hover:text-primary transition-colors italic">Bins Map</Link>
                        <Link href="/complaints" className="text-sm font-semibold text-primary italic px-3 py-1 bg-primary/5 rounded flex items-center gap-2">
                            Complaints
                            <span className="w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold not-italic">
                                {complaints.filter(c => c.status !== 'resolved').length}
                            </span>
                        </Link>
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

            <header className="pt-32 pb-12 px-6 bg-white border-b border-borderColor/50">
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-textMuted hover:text-primary transition-colors mb-6 uppercase tracking-widest italic">
                            <ChevronLeft className="w-3" /> Dashboard
                        </Link>
                        <h1 className="text-3xl font-semibold tracking-tight uppercase italic flex items-center gap-4">
                            <AlertCircle className="w-8 h-8 text-danger" /> Incident Center
                        </h1>
                        <p className="text-sm text-textMuted mt-1">Audit trail of city-wide waste management alerts and dispatches</p>
                    </div>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-lg border border-dashed border-borderColor">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm text-textMuted italic uppercase font-semibold">syncing logs...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-32 bg-surface rounded-lg border border-borderColor border-dashed">
                        <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-6 opacity-20" />
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-textMuted italic">no pending alerts</h3>
                        <p className="text-xs text-textMuted mt-2 italic">all metropolitan sectors are clear</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {complaints.map((item) => (
                            <div key={item._id} className="bg-surface border border-borderColor rounded-lg overflow-hidden flex flex-col hover:bg-white transition-all duration-150 group px-8 pb-8 pt-10">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded border ${getStatusStyle(item.status)}`}>
                                        {item.status}
                                    </span>
                                    <span className="text-[10px] text-textMuted font-semibold uppercase tracking-widest italic opacity-50">
                                        ID: {String(item._id || '').slice(-6)}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-textPrimary mb-1 italic leading-tight capitalize">{item.bin_location}</h3>
                                <p className="text-sm text-textMuted mb-6 italic leading-relaxed">"{item.description}"</p>
                                
                                <div className="mt-auto space-y-5">
                                    <div className="flex items-center gap-3 text-[10px] text-textMuted font-bold uppercase tracking-widest italic pt-6 border-t border-borderColor/50">
                                        <Clock className="w-3.5" />
                                        <span>Log Date: {new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    
                                    {session.user.role === 'admin' && (
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic pb-1">Reported By</label>
                                                    <span className="text-[10px] font-semibold text-textPrimary px-2 py-0.5 bg-borderColor/30 rounded">{item.user_id}</span>
                                                </div>
                                                <div className="text-[10px] text-textMuted italic mb-2">Details: {item.user_details}</div>
                                                
                                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic pb-1 border-t border-borderColor/30 pt-3">Dispatch Agent</label>
                                                <select
                                                    value={item.assigned_driver || ''}
                                                    onChange={(e) => handleAssignDriver(item._id, e.target.value)}
                                                    className="input-field text-xs bg-white py-2 ring-1 ring-primary/10 focus:ring-primary/40"
                                                >
                                                    <option value="">unassigned</option>
                                                    {drivers.map((d, i) => (
                                                        <option key={i} value={d.user_id}>{d.user_id}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                {!item.assigned_driver && item.status !== 'resolved' && (
                                                    <p className="text-[9px] text-danger/70 font-bold italic uppercase tracking-tight mb-1 animate-pulse">
                                                        * assign agent to enable dispatch controls
                                                    </p>
                                                )}
                                                <div className="flex gap-2">
                                                    {item.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(item._id, 'in-progress')}
                                                            disabled={!item.assigned_driver}
                                                            className={`flex-1 py-2 text-[10px] italic font-bold uppercase tracking-widest rounded border transition-all ${!item.assigned_driver ? 'bg-borderColor/10 text-textMuted border-borderColor/40 cursor-not-allowed' : 'btn-secondary bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'}`}
                                                        >
                                                            Start Work
                                                        </button>
                                                    )}
                                                    {item.status === 'driver-completed' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(item._id, 'resolved')}
                                                            className="btn-primary flex-1 py-2 text-[10px] italic font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                                        >
                                                            <ShieldCheck className="w-3" /> Verify & Resolve
                                                        </button>
                                                    )}
                                                    {item.status !== 'resolved' && item.status !== 'driver-completed' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(item._id, 'resolved')}
                                                            disabled={!item.assigned_driver}
                                                            className={`flex-1 py-2 text-[10px] italic font-bold uppercase tracking-widest rounded transition-all ${!item.assigned_driver ? 'bg-borderColor/20 text-textMuted cursor-not-allowed' : 'btn-primary'}`}
                                                        >
                                                            Force Resolve
                                                        </button>
                                                    )}
                                                    {item.status === 'resolved' && (
                                                        <div className="w-full text-center py-2 text-[9px] font-bold text-secondary uppercase tracking-widest bg-secondary/5 border border-secondary/20 rounded">
                                                            Ticket Finalized
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {session.user.role === 'driver' && item.assigned_driver === session.user.name && (
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest italic bg-primary/5 p-3 rounded border border-primary/10 flex items-center gap-2">
                                                <Truck className="w-3.5" /> This task is assigned to you
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    href={item.latitude && item.longitude ? `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.bin_location)}`}
                                                    target="_blank"
                                                    className="btn-secondary w-full py-2.5 text-[10px] italic font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    <MapPin className="w-3" /> View Location Map
                                                </Link>
                                                
                                                {item.status !== 'resolved' && item.status !== 'driver-completed' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(item._id, 'driver-completed')}
                                                        className="btn-primary w-full py-3 text-xs italic font-bold uppercase tracking-widest"
                                                    >
                                                        Mark as Completed
                                                    </button>
                                                )}
                                                
                                                {item.status === 'driver-completed' && (
                                                    <div className="w-full text-center py-3 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded uppercase tracking-widest italic">
                                                        Submitted - Pending Admin Review
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {session.user.role === 'user' && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-borderColor rounded text-[10px] font-bold text-textMuted uppercase tracking-wider italic">
                                            <User className="w-3" /> Agent: {item.assigned_driver || 'pending dispatch'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-primary text-white pt-24 pb-16 mt-24">
                <div className="max-w-[1280px] mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 pb-16 border-b border-white/10">
                        {/* Branding & Info */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                                    <Image src="/logo main.jpg" alt="Logo" fill className="object-cover" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight italic">EcoTrack</span>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed uppercase tracking-widest font-semibold italic">
                                Dedicated incident management and logistics optimization for metropolitan waste networks.
                            </p>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><AlertCircle className="w-4 h-4 text-secondary"/></div>
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><Settings2 className="w-4 h-4 text-secondary"/></div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-8">Navigation</h4>
                            <ul className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-white/60">
                                <li><Link href="/" className="hover:text-white transition-colors">Dashboard Home</Link></li>
                                <li><Link href="/collect" className="hover:text-white transition-colors">Bins Network</Link></li>
                                <li><Link href="/complaints" className="hover:text-white transition-colors">Active Incidents</Link></li>
                                <li><Link href="/collected" className="hover:text-white transition-colors">History Logs</Link></li>
                            </ul>
                        </div>

                        {/* Logistics Network */}
                        <div>
                            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-8">Resources</h4>
                            <ul className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-white/60">
                                <li><Link href="/complaints/new" className="hover:text-white transition-colors">New Submission</Link></li>
                                <li><Link href="/admin/drivers" className="hover:text-white transition-colors">Staff Portal</Link></li>
                                <li><span className="opacity-50 text-[10px]">Security Protocols</span></li>
                                <li><span className="opacity-50 text-[10px]">Data Privacy</span></li>
                            </ul>
                        </div>

                        {/* Contact & Status */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-6">Support Node</h4>
                                <p className="text-sm font-semibold italic leading-none mb-1">080 - 1800 - DISPATCH</p>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Incident Hotline</p>
                            </div>
                            <div className="bg-white/10 p-5 rounded border border-white/20">
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">System Health</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-secondary">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
                                    ALL NODES OPERATIONAL
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] text-white/30 tracking-[0.2em] font-bold uppercase">© 2026 EcoTrack Systems. High-security data environment.</p>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded">
                            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                            <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">Authorized Access Only</span>
                        </div>
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
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-borderColor/50">
                                <Image src="/logo main.jpg" alt="Logo" fill className="object-cover" />
                            </div>
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
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic mb-1">active session</p>
                        <p className="text-2xl font-semibold text-textPrimary leading-none">{session?.user?.name}</p>
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/10 rounded mt-4">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{session?.user?.role} portal</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 flex-grow overflow-y-auto pr-2 pb-8">
                        <Link href="/" className="group" onClick={toggleSidebar}>
                            <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">Overview</span>
                            <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-bold italic">main dashboard</p>
                        </Link>
                        <Link href="/collect" className="group" onClick={toggleSidebar}>
                            <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">Live Map</span>
                            <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-bold italic">network monitoring</p>
                        </Link>
                        <Link href="/complaints" className="group" onClick={toggleSidebar}>
                            <span className="text-3xl font-semibold text-primary italic leading-none flex items-center justify-between">
                                Complaints
                                <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold not-italic">
                                    {complaints.filter(c => c.status !== 'resolved').length}
                                </span>
                            </span>
                            <p className="text-[10px] text-primary/50 mt-1 uppercase tracking-widest font-bold italic">incident management</p>
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
                                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1">system health</p>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
                                    SECURE NODE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
