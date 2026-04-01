'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SubmitComplaintPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        userDetails: '',
        binLocation: '',
        description: ''
    });
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [imageBase64, setImageBase64] = useState('');

    const getLocation = () => {
        setLoadingLocation(true);
        setLocationError('');
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLoadingLocation(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toFixed(6));
                setLongitude(position.coords.longitude.toFixed(6));
                setLoadingLocation(false);
            },
            () => {
                setLocationError('Unable to retrieve your location');
                setLoadingLocation(false);
            }
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-appBg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonGreen"></div>
            </div>
        );
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'user') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-appBg px-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-danger/30 text-center animate-fade-in-up">
                    <h1 className="text-2xl font-bold text-danger mb-4">Access Denied</h1>
                    <p className="text-textMuted mb-6">
                        You must be logged in as a registered user to submit complaints.
                    </p>
                    <Link href="/login" className="block w-full py-3 px-4 bg-neonGreen text-black font-bold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_#00FF88]">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.name,
                    latitude,
                    longitude,
                    image_data: imageBase64,
                    ...formData
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Complaint submitted successfully!' });
                setFormData({
                    userDetails: '',
                    binLocation: '',
                    description: ''
                });
                setLatitude('');
                setLongitude('');
                setImageBase64('');
                setTimeout(() => {
                    router.push('/complaints');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Submission failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-appBg font-sans text-textPrimary relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-electricBlue/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neonGreen/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <header className="py-12 mb-8 relative z-10 animate-fade-in-up border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                    <h1 className="text-4xl font-extrabold text-textPrimary mb-2">
                        Submit <span className="text-transparent bg-clip-text bg-gradient-to-r from-electricBlue to-neonGreen">Complaint</span>
                    </h1>
                    <p className="text-lg text-textMuted">Report issues with bins or waste collection in your area.</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-8">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl font-medium text-center border ${message.type === 'success' ? 'bg-neonGreen/10 text-neonGreen border-neonGreen/30' : 'bg-danger/10 text-danger border-danger/30'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="userDetails" className="block text-sm font-bold text-textMuted">Your Details</label>
                            <input
                                type="text"
                                id="userDetails"
                                name="userDetails"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                placeholder="Your Name and Contact Information"
                                value={formData.userDetails}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="binLocation" className="block text-sm font-bold text-textMuted">Bin Location</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    id="binLocation"
                                    name="binLocation"
                                    className="flex-grow px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                    placeholder="Where is the bin? (e.g. 1st Main Rd)"
                                    value={formData.binLocation}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="px-4 py-3 border border-electricBlue/40 text-electricBlue hover:bg-electricBlue/10 font-bold rounded-xl whitespace-nowrap shadow-sm transition-all text-sm"
                                    onClick={getLocation}
                                    disabled={loadingLocation}
                                >
                                    {loadingLocation ? "Getting..." : "Get Location"}
                                </button>
                            </div>
                            {locationError && <p className="text-danger text-xs mt-1">{locationError}</p>}
                            {(latitude || longitude) && (
                                <p className="text-neonGreen text-xs mt-1 font-mono font-medium">Location attached: Lat {latitude}, Lng {longitude}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="image" className="block text-sm font-bold text-textMuted">Upload Image (Optional)</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-textMuted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-neonGreen/10 file:text-neonGreen hover:file:bg-neonGreen/20 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-neonGreen"
                            />
                            {imageBase64 && (
                                <div className="mt-3 h-40 w-40 relative rounded-xl overflow-hidden border shadow-sm border-white/10">
                                    <img src={imageBase64} alt="Preview" className="object-cover w-full h-full" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-bold text-textMuted">Complaint Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="5"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none resize-none bg-black/30 text-white"
                                placeholder="Describe the issue with the bin (e.g. Overflowing, Damaged, Not collected for days...)"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl bg-neonGreen text-black font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_#00FF88] ${isSubmitting ? 'opacity-70 cursor-not-allowed hidden-shadow' : ''}`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Link href="/complaints" className="text-textMuted hover:text-textPrimary font-medium transition-colors">
                            View My Past Complaints
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
