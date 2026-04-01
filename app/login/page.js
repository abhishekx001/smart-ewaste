'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, User, Lock, Eye, EyeOff, LayoutPanelLeft } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
        role: 'admin'
    });

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                setError("invalid credentials. please check your user id and password.");
                return;
            }
            router.push('/');
        } catch (error) {
            setError("something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12 font-poppins text-textPrimary">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface border border-borderColor mb-6">
                        <Trash2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-textPrimary">Welcome back</h1>
                    <p className="text-sm text-textMuted mt-2">sign in to your ecotrack account</p>
                </div>

                <div className="bg-white border border-borderColor rounded-lg p-10">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-danger text-xs rounded-lg">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="flex bg-surface p-1 rounded-lg border border-borderColor">
                                {['admin', 'driver', 'user'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-150 ${formData.role === role ? 'bg-white text-primary border border-borderColor' : 'text-textMuted hover:text-textPrimary'}`}
                                        onClick={() => setFormData({ ...formData, role })}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-textMuted uppercase tracking-wider">user id</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                                    <input
                                        type="text"
                                        name="userId"
                                        autoComplete="username"
                                        className="input-field pl-10"
                                        placeholder="enter your user id"
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
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        autoComplete="current-password"
                                        className="input-field pl-10 pr-10"
                                        placeholder="enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary py-3.5">
                            sign in
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-borderColor text-center space-y-4">
                        <p className="text-sm text-textMuted">
                            don't have an account? {' '}
                            <Link href="/register" className="text-primary font-medium hover:underline transition-all">
                                register as user
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
