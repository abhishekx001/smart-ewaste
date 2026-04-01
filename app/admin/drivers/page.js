'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
    Users, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ChevronLeft, 
    AlertCircle,
    UserPlus,
    Briefcase,
    FileText,
    Phone,
    Mail
} from "lucide-react";

export default function DriverApplicationManagementPage() {
    const { data: session, status } = useSession();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchApplications();
        } else if (status !== 'loading') {
            setLoading(false);
        }
    }, [status, session]);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/driver-applications');
            const data = await res.json();
            setApplications(data.applications || []);
        } catch (err) {
            console.error("Fetch applicants error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setActionLoading(id);
        try {
            const res = await fetch('/api/driver-applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (res.ok) {
                setApplications(applications.map(app => app.id === id ? { ...app, status: newStatus } : app));
            }
        } catch (err) {
            console.error("Update status error:", err);
        } finally {
            setActionLoading(null);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full bg-red-50 p-10 rounded-lg border border-red-100 text-center">
                    <AlertCircle className="w-12 h-12 text-danger mx-auto mb-6" />
                    <h1 className="text-xl font-semibold text-danger mb-2">Unauthorized Access</h1>
                    <p className="text-sm text-red-600/70 mb-8">This portal is restricted to administrative personnel only.</p>
                    <Link href="/" className="btn-secondary inline-block w-full text-center">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-poppins text-textPrimary selection:bg-primary/10">
            <header className="pt-32 pb-12 px-6 bg-white border-b border-borderColor/50">
                <div className="max-w-[1280px] mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-textMuted hover:text-primary transition-colors mb-6 uppercase tracking-widest italic">
                        <ChevronLeft className="w-3" /> Admin Dashboard
                    </Link>
                    <h1 className="text-3xl font-semibold tracking-tight uppercase italic flex items-center gap-4">
                        <UserPlus className="w-8 h-8 text-primary" /> Recruit Management
                    </h1>
                    <p className="text-sm text-textMuted mt-1">Reviewing city-wide logistics personnel applications for driver positions</p>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-center py-32">
                         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-32 bg-surface rounded-lg border border-borderColor border-dashed">
                        <Users className="w-12 h-12 text-textMuted mx-auto mb-6 opacity-20" />
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-textMuted italic">No applications pending</h3>
                        <p className="text-xs text-textMuted mt-2 italic">recruitment queue is currently empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {applications.map((item) => (
                            <div key={item.id} className="bg-surface border border-borderColor rounded-lg overflow-hidden flex flex-col hover:bg-white transition-all duration-150 group p-8 relative">
                                <div className="absolute top-6 right-8">
                                    {item.status === 'pending' ? (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-warning/5 border border-warning/20 text-warning text-[8px] font-bold uppercase tracking-widest rounded animate-pulse">
                                            <Clock className="w-2.5 h-2.5" /> pending
                                        </div>
                                    ) : item.status === 'approved' ? (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary/5 border border-secondary/20 text-secondary text-[8px] font-bold uppercase tracking-widest rounded">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> approved
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-danger/5 border border-danger/20 text-danger text-[8px] font-bold uppercase tracking-widest rounded">
                                            <XCircle className="w-2.5 h-2.5" /> rejected
                                        </div>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold tracking-tight italic mb-1 uppercase text-primary">{item.full_name}</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-textMuted font-bold uppercase tracking-[0.2em] italic">
                                        <Briefcase className="w-3" /> {item.experience_years} years exp
                                    </div>
                                </div>

                                <div className="space-y-6 flex-grow mb-10">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs">
                                            <Mail className="w-4 h-4 text-textMuted" />
                                            <span className="font-medium italic border-b border-borderColor/50 pb-0.5">{item.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <Phone className="w-4 h-4 text-textMuted" />
                                            <span className="font-medium italic border-b border-borderColor/50 pb-0.5">{item.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <FileText className="w-4 h-4 text-textMuted" />
                                            <span className="font-medium italic uppercase tracking-widest opacity-50 pb-0.5">{item.license_number}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-borderColor/50 flex justify-between items-center text-[10px]">
                                        <span className="text-textMuted font-bold uppercase italic opacity-50 tracking-widest">Entry Date</span>
                                        <span className="font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {item.status === 'pending' && (
                                    <div className="mt-auto flex gap-3">
                                        <button 
                                            onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                            disabled={actionLoading === item.id}
                                            className="flex-1 btn-secondary py-3 text-[10px] font-bold uppercase tracking-widest text-danger hover:bg-danger/5 hover:border-danger/20 transition-all active:scale-95"
                                        >
                                            {actionLoading === item.id ? '...' : 'Reject Application'}
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(item.id, 'approved')}
                                            disabled={actionLoading === item.id}
                                            className="flex-1 btn-primary py-3 text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all"
                                        >
                                            {actionLoading === item.id ? '...' : 'Approve Staff'}
                                        </button>
                                    </div>
                                )}

                                {item.status !== 'pending' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(item.id, 'pending')}
                                        disabled={actionLoading === item.id}
                                        className="mt-auto w-full btn-secondary py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-surface transition-all italic opacity-50 group-hover:opacity-100"
                                    >
                                        re-evaluate entry
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-primary/5 py-12 mt-20 border-t border-borderColor">
                <div className="max-w-[1280px] mx-auto px-6 text-center">
                    <p className="text-[10px] text-textMuted italic tracking-widest uppercase opacity-50 font-bold">city waste recruitment control unit &copy; 2026</p>
                </div>
            </footer>
        </div>
    );
}
