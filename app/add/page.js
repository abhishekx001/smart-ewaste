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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Authentication Required</h1>
                    <p className="text-gray-600 text-center mb-6">
                        You must be logged in to access this page.
                    </p>
                    <Link href="/login" className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-center font-bold rounded-xl transition-colors shadow-lg shadow-green-200">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Role check: Only cleaners can access this page
    if (session?.user?.role !== 'cleaner') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500">
                    <h1 className="text-3xl font-bold text-red-600 mb-4 text-center">Access Denied</h1>
                    <p className="text-gray-600 text-center mb-6">
                        This page is restricted to Cleaners only.<br />It seems this is not your purpose.
                    </p>
                    <Link href="/" className="block w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-center font-bold rounded-xl transition-colors shadow-lg shadow-red-200">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('/image4.webp')] bg-cover bg-center -z-10"></div>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm -z-10"></div>

            <div className="max-w-2xl w-full bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100 z-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 font-oswald tracking-wide">
                    {isEditMode ? 'Edit' : 'Add'} <span className="text-gray-800">Location</span>
                </h1>

                <form className="space-y-6" onSubmit={handleSubmit}>

                    {submitMessage.text && (
                        <div className={`p-4 rounded-lg text-center font-medium ${submitMessage.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {submitMessage.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="street" className="block text-sm font-semibold text-gray-700">Street Address</label>
                        <textarea
                            id="street"
                            name="street"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-none bg-gray-50 focus:bg-white"
                            placeholder="Enter building number, area, street"
                            value={formData.street}
                            onChange={handleChange}
                            required
                            rows="3"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="city" className="block text-sm font-semibold text-gray-700">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700">Pincode</label>
                            <input
                                type="text"
                                id="pincode"
                                name="pincode"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="123456"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700">Coordinates</label>
                        <button
                            type="button"
                            className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-blue-200 shadow-sm"
                            onClick={getLocation}
                            disabled={loadingLocation}
                        >
                            {loadingLocation ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
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

                        {locationError && <p className="text-red-500 text-sm">{locationError}</p>}

                        {(formData.latitude || formData.longitude) && (
                            <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="font-mono">Lat: {formData.latitude}</span>
                                <span className="font-mono border-l border-gray-300 pl-4">Long: {formData.longitude}</span>
                            </div>
                        )}

                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <span className="text-sm text-amber-700">
                                    <strong>Important:</strong> Please ensure your Pincode and Geolocation match the same area. avoid using VPNs as they may affect location accuracy.
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                {isEditMode ? 'Updating...' : 'Registering...'}
                            </div>
                        ) : (
                            isEditMode ? 'Update Location' : 'Register Location'
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        }>
            <AddLocationContent />
        </Suspense>
    );
}
