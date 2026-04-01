'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Separate the content that uses searchParams into its own component
function AddLocationContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Check if we are in edit mode
    const isEditMode = searchParams.get('edit') === 'true';
    const editId = searchParams.get('id');

    const [loadingLocation, setLoadingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [locationError, setLocationError] = useState('');
    const [formData, setFormData] = useState({
        street: searchParams.get('street') || '',
        city: searchParams.get('city') || '',
        state: '',
        pincode: searchParams.get('pincode') || '',
        latitude: searchParams.get('lat') || '',
        longitude: searchParams.get('lng') || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
                setLoadingLocation(false);
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location permission denied. Please enable it in your browser settings.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = 'Location information is unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = 'The request to get user location timed out.';
                }
                setLocationError(errorMessage);
                setLoadingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            const endpoint = '/api/location';
            const method = isEditMode ? 'PUT' : 'POST';
            const bodyData = {
                address: formData.street,
                city: formData.city,
                pincode: formData.pincode,
                latitude: formData.latitude,
                longitude: formData.longitude,
            };

            if (isEditMode) {
                bodyData.id = editId;
            }

            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitMessage({ type: 'success', text: isEditMode ? 'Location updated successfully!' : 'Location added successfully!' });

                if (isEditMode) {
                    setTimeout(() => {
                        router.push('/collect');
                    }, 1500);
                } else {
                    setFormData({
                        street: '',
                        city: '',
                        state: '',
                        pincode: '',
                        latitude: '',
                        longitude: ''
                    });
                }
            } else {
                setSubmitMessage({ type: 'error', text: data.message || 'Failed to add location' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/10 transform transition-all">
                    <h1 className="text-3xl font-bold text-textPrimary mb-4 text-center">Authentication Required</h1>
                    <p className="text-textMuted text-center mb-6">
                        You must be logged in to access this page.
                    </p>
                    <Link href="/login" className="block w-full py-3 px-4 bg-neonGreen text-black text-center font-bold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_#00FF88]">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Role check: Only admins can access this page
    if (session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-appBg px-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-danger/50">
                    <h1 className="text-3xl font-bold text-danger mb-4 text-center">Access Denied</h1>
                    <p className="text-textMuted text-center mb-6">
                        This page is restricted to Admins only.<br />It seems this is not your purpose.
                    </p>
                    <Link href="/" className="block w-full py-3 px-4 bg-danger/20 text-danger border border-danger/30 text-center font-bold rounded-xl transition-colors hover:bg-danger/30">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-appBg py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('/image4.webp')] bg-cover bg-center -z-10 opacity-20"></div>
            <div className="absolute inset-0 bg-appBg/90 backdrop-blur-sm -z-10"></div>

            <div className="max-w-2xl w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-8 sm:p-10 border border-white/10 z-10 animate-fade-in-up">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-textPrimary mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-neonGreen to-electricBlue font-oswald tracking-wide">
                    {isEditMode ? 'Edit' : 'Add'} <span className="text-electricBlue">Location</span>
                </h1>

                <form className="space-y-6" onSubmit={handleSubmit}>

                    {submitMessage.text && (
                        <div className={`p-4 rounded-lg text-center font-medium ${submitMessage.type === 'success'
                            ? 'bg-neonGreen/10 text-neonGreen border border-neonGreen/30'
                            : 'bg-danger/10 text-danger border border-danger/30'
                            }`}>
                            {submitMessage.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="street" className="block text-sm font-semibold text-textMuted">Street Address</label>
                        <textarea
                            id="street"
                            name="street"
                            className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none resize-none bg-black/30 text-white"
                            placeholder="Enter building number, area, street"
                            value={formData.street}
                            onChange={handleChange}
                            required
                            rows="3"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="city" className="block text-sm font-semibold text-textMuted">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="pincode" className="block text-sm font-semibold text-textMuted">Pincode</label>
                            <input
                                type="text"
                                id="pincode"
                                name="pincode"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                placeholder="123456"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <label className="block text-sm font-semibold text-textMuted">Coordinates</label>
                        <button
                            type="button"
                            className="w-full py-3 px-4 border border-electricBlue/40 text-electricBlue rounded-xl hover:bg-electricBlue/10 transition-colors flex items-center justify-center gap-2"
                            onClick={getLocation}
                            disabled={loadingLocation}
                        >
                            {loadingLocation ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-electricBlue border-t-transparent rounded-full animate-spin"></span>
                                    Getting Location...
                                </span>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    Get Current Location
                                </>
                            )}
                        </button>

                        {locationError && <p className="text-danger text-sm">{locationError}</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1 text-sm">
                                <label className="block font-semibold text-textMuted">Latitude (Optional)</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    className="w-full p-2.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none bg-black/30 font-mono text-white"
                                    placeholder="Enter manually or use button"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-1 text-sm">
                                <label className="block font-semibold text-textMuted">Longitude (Optional)</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    className="w-full p-2.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none bg-black/30 font-mono text-white"
                                    placeholder="Enter manually or use button"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-warning mt-0.5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <span className="text-sm text-warning">
                                    <strong>Important:</strong> Please ensure your Pincode and Geolocation match the same area. avoid using VPNs as they may affect location accuracy.
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-4 rounded-xl bg-neonGreen text-black font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_#00FF88] ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                {isEditMode ? 'Updating...' : 'Registering...'}
                            </div>
                        ) : (
                            isEditMode ? 'Update Location' : 'Register Location'
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <Link href="/" className="text-textMuted hover:text-textPrimary text-sm font-medium transition-colors">
                            Cancel & Return Home
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );

}

// Main page component wrapped in Suspense
export default function AddLocationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-appBg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonGreen"></div>
            </div>
        }>
            <AddLocationContent />
        </Suspense>
    );
}
