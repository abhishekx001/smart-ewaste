'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin, ChevronLeft, AlertCircle, CheckCircle2, Navigation, Loader2 } from 'lucide-react';

function AddLocationContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getLocation = () => {
        setLoadingLocation(true);
        setLocationError('');
        if (!navigator.geolocation) {
            setLocationError('geolocation is not supported by your browser');
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
                setLocationError('unable to retrieve your location. please check permissions.');
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
            if (isEditMode) bodyData.id = editId;

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitMessage({ type: 'success', text: isEditMode ? 'location updated successfully!' : 'location registered successfully!' });
                if (isEditMode) {
                    setTimeout(() => router.push('/collect'), 1500);
                } else {
                    setFormData({ street: '', city: '', state: '', pincode: '', latitude: '', longitude: '' });
                }
            } else {
                setSubmitMessage({ type: 'error', text: data.message || 'failed to process request' });
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', text: 'an unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <p className="text-sm text-textMuted mb-8">you must be logged in to access this feature.</p>
                    <Link href="/login" className="btn-primary inline-block w-full text-center">go to login portal</Link>
                </div>
            </div>
        );
    }

    if (session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full bg-red-50 p-10 rounded-lg border border-red-100 text-center">
                    <AlertCircle className="w-12 h-12 text-danger mx-auto mb-6" />
                    <h1 className="text-xl font-semibold text-danger mb-2">access denied</h1>
                    <p className="text-sm text-red-600/70 mb-8">this page is restricted to administrators only.</p>
                    <Link href="/" className="btn-secondary inline-block w-full text-center">return home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-poppins text-textPrimary py-12 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-textMuted hover:text-primary transition-colors mb-6 italic">
                        <ChevronLeft className="w-3 h-3" /> back to home
                    </Link>
                    <h1 className="text-3xl font-semibold tracking-tight uppercase italic text-textPrimary">
                        {isEditMode ? 'edit' : 'register'} <span className="text-primary italic">infrastructure</span>
                    </h1>
                    <p className="text-sm text-textMuted mt-1">add new bin locations to the city-wide monitoring network</p>
                </div>

                <div className="bg-white border border-borderColor rounded-lg p-10">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {submitMessage.text && (
                            <div className={`p-4 rounded-lg text-center text-xs font-medium border ${
                                submitMessage.type === 'success' ? 'bg-green-50 border-green-100 text-primary' : 'bg-red-50 border-red-100 text-danger'
                            }`}>
                                {submitMessage.text}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="label-sm">street address</label>
                                <textarea
                                    name="street"
                                    className="input-field min-h-[100px] resize-none"
                                    placeholder="enter exact building or street details..."
                                    value={formData.street}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="label-sm">city</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="input-field"
                                        placeholder="locality / city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="label-sm">pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        className="input-field"
                                        placeholder="6 digits code"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-borderColor space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="label-sm">geographic coordinates</label>
                                    <button
                                        type="button"
                                        onClick={getLocation}
                                        disabled={loadingLocation}
                                        className="inline-flex items-center gap-2 text-[10px] font-semibold text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                                    >
                                        {loadingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                                        auto-detect my location
                                    </button>
                                </div>

                                {locationError && <p className="text-[10px] text-danger italic">{locationError}</p>}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="latitude"
                                        className="input-field text-xs bg-surface"
                                        placeholder="latitude (e.g. 12.9716)"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        name="longitude"
                                        className="input-field text-xs bg-surface"
                                        placeholder="longitude (e.g. 77.5946)"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex gap-3">
                                    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-yellow-800 leading-relaxed italic">
                                        <strong>Accuracy Check:</strong> ensure pincode and geographic data correspond to the same sector. precise coordinates improve collection route efficiency.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {isEditMode ? 'update location' : 'register new site'}
                            </button>
                            <Link href="/" className="btn-secondary w-full text-center py-4 text-xs italic">
                                cancel process
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function AddLocationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <AddLocationContent />
        </Suspense>
    );
}
