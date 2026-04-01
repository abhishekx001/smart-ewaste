'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
        role: 'admin' // Default role
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

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

        try {
            const result = await signIn('credentials', {
                userId: formData.userId,
                password: formData.password,
                role: formData.role,
                redirect: false
            });

            if (result.error) {
                setError("Invalid credentials. Please check your User ID and Password.");
                return;
            }

            router.push('/');
        } catch (error) {
            setError("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-appBg px-4 py-8 font-sans relative overflow-hidden animate-fade-in-up text-textPrimary">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('/img2.webp')] bg-cover bg-center -z-10 opacity-20"></div>
            <div className="absolute inset-0 bg-appBg/90 backdrop-blur-sm -z-10"></div>

            {/* Glowing blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonGreen/10 rounded-full blur-[100px] mix-blend-screen animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electricBlue/10 rounded-full blur-[100px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

            <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden z-10 border border-white/10 transition-all duration-300 hover:border-neonGreen/30 hover:shadow-[0_0_40px_rgba(0,255,136,0.1)]">
                <div className="bg-black/40 p-8 text-center relative overflow-hidden border-b border-white/10">
                    <h1 className="text-3xl font-extrabold text-textPrimary mb-2 relative z-10 font-oswald tracking-wide">
                        Welcome <span className="opacity-90 font-light text-neonGreen">Back</span>
                    </h1>
                    <p className="text-textMuted text-sm">Sign in to manage waste collection</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-danger/10 border-l-4 border-danger text-danger text-sm rounded-xl">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/10">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${formData.role === 'admin'
                                ? 'bg-white/10 text-neonGreen shadow-sm'
                                : 'text-textMuted hover:text-textPrimary'
                                }`}
                            onClick={() => setFormData({ ...formData, role: 'admin' })}
                        >
                            Admin
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${formData.role === 'driver'
                                ? 'bg-white/10 text-neonGreen shadow-sm'
                                : 'text-textMuted hover:text-textPrimary'
                                }`}
                            onClick={() => setFormData({ ...formData, role: 'driver' })}
                        >
                            Driver
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${formData.role === 'user'
                                ? 'bg-white/10 text-neonGreen shadow-sm'
                                : 'text-textMuted hover:text-textPrimary'
                                }`}
                            onClick={() => setFormData({ ...formData, role: 'user' })}
                        >
                            User
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="userId" className="block text-sm font-bold text-textMuted">User ID</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    id="userId"
                                    name="userId"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                    placeholder="Enter your user ID"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-textMuted">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-neonGreen focus:outline-none transition-all outline-none bg-black/30 text-white"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textPrimary transition-colors"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 px-4 bg-neonGreen text-black font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-[0_0_20px_#00FF88]"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-textMuted flex flex-col space-y-3">
                        <span>
                            Don't have an account?{' '}
                            <Link href="/register" className="text-neonGreen hover:text-white font-semibold transition-colors">
                                Register as User
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
