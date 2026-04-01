'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AlertCircle, Camera, MapPin, ChevronLeft, CheckCircle2, Loader2, Send } from 'lucide-react';

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
            setLocationError('geolocation not supported');
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
                setLocationError('unable to retrieve location');
                setLoadingLocation(false);
            }
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageBase64(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            if (res.ok) {
                setMessage({ type: 'success', text: 'complaint submitted successfully!' });
                setFormData({ userDetails: '', binLocation: '', description: '' });
                setLatitude(''); setLongitude(''); setImageBase64('');
                setTimeout(() => router.push('/complaints'), 2000);
            } else {
                setMessage({ type: 'error', text: 'submission failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'an unexpected error occurred' });
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

    if (status === 'unauthenticated' || session?.user?.role !== 'user') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full bg-red-50 p-10 rounded-lg border border-red-100 text-center">
                    <AlertCircle className="w-12 h-12 text-danger mx-auto mb-6" />
                    <h1 className="text-xl font-semibold text-danger mb-2">access denied</h1>
                    <p className="text-sm text-red-600/70 mb-8">you must be logged in as a registered user to submit complaints.</p>
                    <Link href="/login" className="btn-secondary inline-block w-full text-center">go to login portal</Link>
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
                        report <span className="text-primary italic">incident</span>
                    </h1>
                    <p className="text-sm text-textMuted mt-1">document and report overflow or damage to the city audit team</p>
                </div>

                <div className="bg-white border border-borderColor rounded-lg p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {message.text && (
                            <div className={`p-4 rounded-lg text-center text-xs font-medium border ${
                                message.type === 'success' ? 'bg-green-50 border-green-100 text-primary' : 'bg-red-50 border-red-100 text-danger'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="label-sm">reporter identity</label>
                                <input
                                    type="text"
                                    name="userDetails"
                                    className="input-field"
                                    placeholder="your name and contact info..."
                                    value={formData.userDetails}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="label-sm">incident location</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        name="binLocation"
                                        className="input-field flex-grow"
                                        placeholder="specific bin area or street..."
                                        value={formData.binLocation}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={getLocation}
                                        disabled={loadingLocation}
                                        className="btn-secondary whitespace-nowrap text-xs border-secondary/20 text-secondary"
                                    >
                                        {loadingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : 'pin location'}
                                    </button>
                                </div>
                                {locationError && <p className="text-[10px] text-danger italic mt-1">{locationError}</p>}
                                {(latitude || longitude) && (
                                    <p className="text-[10px] text-secondary italic mt-1 px-2 border-l border-secondary">
                                        gps coordinates attached: {latitude}, {longitude}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="label-sm">visual evidence (optional)</label>
                                <div className="flex flex-col gap-4">
                                    <div className="relative group overflow-hidden">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="btn-secondary w-full py-4 flex items-center justify-center gap-2 italic">
                                            <Camera className="w-4 h-4" />
                                            {imageBase64 ? 'change evidence image' : 'upload photo evidence'}
                                        </div>
                                    </div>
                                    {imageBase64 && (
                                        <div className="h-48 w-full relative rounded-sm overflow-hidden border border-borderColor bg-surface">
                                            <img src={imageBase64} alt="Evidence" className="object-cover w-full h-full" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="label-sm">incident description</label>
                                <textarea
                                    name="description"
                                    rows="5"
                                    className="input-field min-h-[120px] resize-none"
                                    placeholder="describe the issue in detail (overflowing, damaged, missing, etc)..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {isSubmitting ? 'submitting report...' : 'dispatch complaint'}
                            </button>
                            <Link href="/complaints" className="btn-secondary w-full text-center py-4 text-xs italic">
                                cancel and view records
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
