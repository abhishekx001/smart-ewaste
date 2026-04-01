'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Trash2, User, Lock, LayoutPanelLeft, UserCircle } from 'lucide-react';

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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError("passwords do not match");
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
                setSuccess('registration successful. logging you in...');
                const result = await signIn('credentials', {
                    userId: formData.userId,
                    password: formData.password,
                    role: 'user',
                    redirect: false
                });

                if (result.error) {
                    setError('registration successful, but auto-login failed. please login manually.');
                    router.push('/login');
                } else {
                    router.push('/');
                }
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'registration failed');
            }
        } catch (error) {
            setError('something went wrong during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12 font-poppins text-textPrimary">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface border border-borderColor mb-6">
                        <UserCircle className="w-8 h-8 text-secondary" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-textPrimary">Join EcoTrack</h1>
                    <p className="text-sm text-textMuted mt-2">register to participate in smart waste management</p>
                </div>

                <div className="bg-white border border-borderColor rounded-lg p-10">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-danger text-xs rounded-lg">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-8 p-4 bg-green-50 border border-green-200 text-primary text-xs rounded-lg">
                            {success}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider">user id</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="text"
                                        name="userId"
                                        autoComplete="username"
                                        className="input-field pl-10"
                                        placeholder="choose a user id"
                                        value={formData.userId}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider">password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="password"
                                        name="password"
                                        autoComplete="new-password"
                                        className="input-field pl-10"
                                        placeholder="create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider">confirm password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        className="input-field pl-10"
                                        placeholder="confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
                        >
                            {isLoading ? "creating account..." : "register"}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-borderColor text-center space-y-4">
                        <p className="text-sm text-textMuted">
                            already have an account? {' '}
                            <Link href="/login" className="text-primary font-medium hover:underline transition-all">
                                login hero
                            </Link>
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 text-xs text-textMuted hover:text-primary transition-colors">
                            <LayoutPanelLeft className="w-3 h-3" /> back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
