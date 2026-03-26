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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'user') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        You must be logged in as a registered user to submit complaints.
                    </p>
                    <Link href="/login" className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
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
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white border-b border-gray-200 py-12 mb-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Submit <span className="text-green-600">Complaint</span>
                    </h1>
                    <p className="text-lg text-gray-500">Report issues with bins or waste collection in your area.</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg font-medium text-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="userDetails" className="block text-sm font-bold text-gray-700">Your Details</label>
                            <input
                                type="text"
                                id="userDetails"
                                name="userDetails"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="Your Name and Contact Information"
                                value={formData.userDetails}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="binLocation" className="block text-sm font-bold text-gray-700">Bin Location</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="binLocation"
                                    name="binLocation"
                                    className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Where is the bin? (e.g. 1st Main Rd)"
                                    value={formData.binLocation}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg whitespace-nowrap border border-blue-200 shadow-sm transition-colors text-sm"
                                    onClick={getLocation}
                                    disabled={loadingLocation}
                                >
                                    {loadingLocation ? "Getting..." : "Get Location"}
                                </button>
                            </div>
                            {locationError && <p className="text-red-500 text-xs mt-1">{locationError}</p>}
                            {(latitude || longitude) && (
                                <p className="text-green-600 text-xs mt-1 font-mono font-medium">Location attached: Lat {latitude}, Lng {longitude}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="image" className="block text-sm font-bold text-gray-700">Upload Image (Optional)</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer"
                            />
                            {imageBase64 && (
                                <div className="mt-3 h-32 w-32 relative rounded-lg overflow-hidden border shadow-sm border-gray-200">
                                    <img src={imageBase64} alt="Preview" className="object-cover w-full h-full" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-bold text-gray-700">Complaint Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="5"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-none bg-gray-50 focus:bg-white"
                                placeholder="Describe the issue with the bin (e.g. Overflowing, Damaged, Not collected for days...)"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-700 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5'}`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Link href="/complaints" className="text-gray-500 hover:text-green-600 font-medium transition-colors">
                            View My Past Complaints
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
