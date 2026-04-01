'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: formData.userId,
                    password: formData.password,
                    role: 'user'
                })
            });

            if (res.ok) {
                setSuccess('Registration successful. Logging you in...');
                
                // Automatically log in the user
                const result = await signIn('credentials', {
                    userId: formData.userId,
                    password: formData.password,
                    role: 'user',
                    redirect: false
                });

                if (result.error) {
                    setError('Registration successful, but auto-login failed. Please login manually.');
                    router.push('/login');
                } else {
                    router.push('/');
                }
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Registration failed');
            }
        } catch (error) {
            setError('Something went wrong during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-appBg px-4 py-8 font-sans relative overflow-hidden text-textPrimary animate-fade-in-up">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('/img2.webp')] bg-cover bg-center -z-10 opacity-20"></div>
            <div className="absolute inset-0 bg-appBg/90 backdrop-blur-sm -z-10"></div>

            {/* Glowing blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonGreen/10 rounded-full blur-[100px] mix-blend-screen animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electricBlue/10 rounded-full blur-[100px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

            <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden z-10 border border-white/10 transition-all duration-300 hover:border-neonGreen/30 hover:shadow-[0_0_40px_rgba(0,255,136,0.1)]">
                <div className="bg-black/40 p-8 text-center relative overflow-hidden border-b border-white/10">
                    <h1 className="text-3xl font-extrabold text-textPrimary mb-2 relative z-10 font-oswald tracking-wide">
                        Create <span className="opacity-90 font-light text-neonGreen">Account</span>
                    </h1>
                    <p className="text-textMuted text-sm">Register as a user to submit complaints</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-danger/10 border-l-4 border-danger text-danger text-sm rounded-xl">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-6 p-4 bg-neonGreen/10 border-l-4 border-neonGreen text-neonGreen text-sm rounded-xl">
                            <p className="font-bold">Success</p>
                            <p>{success}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="userId" className="block text-sm font-bold text-textMuted">User ID</label>
                            <input
                                type="text"
                                id="userId"
                                name="userId"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                placeholder="Choose a user ID"
                                value={formData.userId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-textMuted">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-textMuted">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 px-4 bg-neonGreen text-black font-bold rounded-xl shadow-lg transition-all ${isLoading ? "opacity-70 cursor-not-allowed hidden-shadow" : "hover:scale-105 hover:shadow-[0_0_20px_#00FF88]"}`}
                        >
                            {isLoading ? "Creating Account..." : "Register"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-textMuted flex flex-col space-y-3">
                        <span>
                            Already have an account?{' '}
                            <Link href="/login" className="text-neonGreen hover:text-white font-semibold transition-colors">
                                Login here
                            </Link>
                        </span>
                        <Link href="/" className="hover:text-neonGreen transition-colors">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
