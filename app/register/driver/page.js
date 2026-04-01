'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Truck, 
    User, 
    Phone, 
    Mail, 
    FileText, 
    ChevronLeft, 
    Briefcase,
    CheckCircle
} from 'lucide-react';

export default function DriverJobApplicationPage() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        experienceYears: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/driver-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(true);
                setFormData({ fullName: '', email: '', phone: '', licenseNumber: '', experienceYears: '' });
            } else {
                const data = await res.json();
                setError(data.message || 'Submission failed');
            }
        } catch (error) {
            setError('Something went wrong during submission');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full bg-surface border border-borderColor rounded-lg p-10 text-center">
                    <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-6" />
                    <h1 className="text-2xl font-bold italic uppercase tracking-tight text-textPrimary">Application Received</h1>
                    <p className="text-sm text-textMuted mt-4 mb-8 italic">
                        Our recruitment team will review your credentials and contact you via email once a decision is made.
                    </p>
                    <Link href="/" className="btn-primary inline-block w-full py-4 text-xs font-bold uppercase tracking-widest">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-poppins text-textPrimary selection:bg-primary/10 py-20 px-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-bold text-textMuted hover:text-primary transition-colors mb-10 uppercase tracking-widest italic">
                    <ChevronLeft className="w-3" /> Back to Dashboard
                </Link>

                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight uppercase italic">Driver Recruitment</h1>
                    </div>
                    <p className="text-sm text-textMuted border-l-2 border-primary pl-4 py-1">
                        Apply to become an integral part of our metropolitan smart waste management network.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-surface p-10 rounded-lg border border-borderColor">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-danger text-xs italic font-semibold rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Person Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic">Full Legal Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="input-field pl-10 h-12 bg-white"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="input-field pl-10 h-12 bg-white"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="input-field pl-10 h-12 bg-white"
                                        placeholder="+1 234 567 890"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic">Driver License No.</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        className="input-field pl-10 h-12 bg-white"
                                        placeholder="DL-8293-XXXX"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic">Experience (Years)</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="number"
                                        name="experienceYears"
                                        className="input-field pl-10 h-12 bg-white"
                                        placeholder="5"
                                        value={formData.experienceYears}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-borderColor/50">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:gap-5"
                        >
                            {isLoading ? 'Processing Entry...' : (
                                <>
                                    Submit Official Application
                                    <Truck className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <footer className="mt-12 text-center">
                    <p className="text-[10px] text-textMuted italic tracking-widest uppercase opacity-50">
                        &copy; 2026 eco-waste city logistics department. all applications are subject to audit.
                    </p>
                </footer>
            </div>
        </div>
    );
}
