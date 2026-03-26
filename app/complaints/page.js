'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ComplaintsPage() {
    const { data: session, status } = useSession();
    const [complaints, setComplaints] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    const [drivers, setDrivers] = useState([]);
    const [solvingId, setSolvingId] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && ['user', 'admin', 'driver'].includes(session?.user?.role)) {
            const fetchComplaints = async () => {
                try {
                    let url = `/api/complaints?userId=${session.user.name}&role=${session.user.role}`;
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('Failed to fetch complaints');
                    const data = await res.json();
                    setComplaints(data.complaints || []);
                } catch (err) {
                    setError('Failed to load past complaints');
                } finally {
                    setLoadingData(false);
                }
            };
            fetchComplaints();
            if (session?.user?.role === 'admin') {
                fetch('/api/drivers')
                    .then(res => res.json())
                    .then(data => setDrivers(data.drivers || []))
                    .catch(err => console.error("Drivers fetch error:", err));
            }
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

    if (status === 'unauthenticated' || !['user', 'admin', 'driver'].includes(session?.user?.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500">
                    <h1 className="text-2xl font-bold text-red-600 mb-4 text-center">Access Denied</h1>
                    <p className="text-gray-600 text-center mb-6">
                        You must be logged in to view complaints.
                    </p>
                    <Link href="/login" className="block w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-center font-bold rounded-xl transition-colors shadow-md">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch('/api/complaints', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            if (res.ok) {
                setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignDriver = async (id) => {
        if (!selectedDriver) {
            alert('Please select a driver first!');
            return;
        }
        try {
            const res = await fetch('/api/complaints', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, assigned_driver: selectedDriver, status: 'assigned' })
            });
            if (res.ok) {
                setComplaints(prev => prev.map(c => c.id === id ? { ...c, assigned_driver: selectedDriver, status: 'assigned' } : c));
                setSolvingId(null);
                setSelectedDriver('');
            } else {
                alert('Failed to assign driver');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white border-b border-gray-200 py-12 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            {session?.user?.role === 'admin' ? 'All ' : session?.user?.role === 'driver' ? 'Dispatched ' : 'My '}
                            <span className="text-green-600">Complaints</span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl">
                            {session?.user?.role === 'admin' ? 'Manage and update reported issues.' : 'Track the status of your past reports.'}
                        </p>
                    </div>
                    {session?.user?.role === 'user' && (
                        <div>
                            <Link href="/complaints/new" className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition-colors inline-block">
                                + New Complaint
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <p className="text-gray-500">Loading your complaints...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-red-500 font-semibold">{error}</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <p className="text-xl text-gray-500 font-medium">No complaints found.</p>
                        <p className="text-gray-400 mt-2">You haven't reported any issues yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {complaints.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                                        item.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                        item.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                                        item.status === 'approved' ? 'bg-amber-100 text-amber-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {item.status || 'Pending'}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                {session?.user?.role === 'admin' && (
                                    <p className="text-xs text-gray-400 mb-2 font-mono">Reported by: {item.user_details}</p>
                                )}
                                {item.assigned_driver && session?.user?.role === 'admin' && (
                                    <p className="text-xs text-purple-600 font-bold mb-2">Assigned to: {item.assigned_driver}</p>
                                )}
                                
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.bin_location}</h3>
                                <p className="text-gray-600 text-sm flex-grow bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {item.description}
                                </p>
                                
                                {item.image_data && (
                                    <div className="mt-4 w-full h-40 relative rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                        <img src={item.image_data} alt="Complaint Evidence" className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                                    </div>
                                )}

                                {item.latitude && item.longitude && (
                                    <div className="mt-4">
                                        <Link
                                            href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                                            target="_blank"
                                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold hover:bg-blue-100 transition-colors text-sm shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                            View Pinned Location
                                        </Link>
                                    </div>
                                )}
                                
                                {session?.user?.role === 'admin' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        {solvingId === item.id ? (
                                            <div className="flex flex-col gap-3">
                                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Select Driver</p>
                                                <select 
                                                    value={selectedDriver} 
                                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 font-semibold cursor-pointer text-gray-700"
                                                >
                                                    <option value="" disabled>--- Available Drivers ---</option>
                                                    {drivers.map(d => (
                                                        <option key={d.user_id} value={d.user_id}>{d.user_id}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleAssignDriver(item.id)}
                                                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
                                                    >
                                                        Send Options
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSolvingId(null); setSelectedDriver(''); }}
                                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg text-sm transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setSolvingId(item.id)}
                                                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-sm transition-colors border border-gray-300 shadow-sm"
                                            >
                                                Solve (Assign Driver)
                                            </button>
                                        )}
                                    </div>
                                )}
                                
                                {(session?.user?.role === 'admin' || session?.user?.role === 'driver') && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                        <button 
                                            onClick={() => handleStatusChange(item.id, 'approved')}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${item.status === 'approved' ? 'bg-amber-600 text-white pointer-events-none' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                                        >
                                            {item.status === 'approved' ? 'Approved ✓' : 'Approve'}
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(item.id, 'resolved')}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${item.status === 'resolved' ? 'bg-green-600 text-white pointer-events-none' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        >
                                            {item.status === 'resolved' ? 'Resolved ✓' : 'Resolve'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
