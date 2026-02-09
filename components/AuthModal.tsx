"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const body = isLogin ? { username, password } : { username, password, email };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");

            onSuccess(data);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-md glass-panel p-8 rounded-3xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"
                        >
                            <Plus className="w-6 h-6 rotate-45" />
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-serif font-light mb-2">
                                {isLogin ? "Welcome Back" : "Join the Thread"}
                            </h2>
                            <p className="text-xs text-white/30 uppercase tracking-[0.2em]">
                                {isLogin ? "Continue your journey" : "Create your identity"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    aria-label="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all font-mono text-sm"
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email (Optional)"
                                        aria-label="Email (Optional)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all font-mono text-sm"
                                    />
                                </div>
                            )}

                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    aria-label="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all font-mono text-sm"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-xs mt-2 text-center uppercase tracking-widest">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-gray-200 transition-all mt-4 disabled:opacity-50"
                            >
                                {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-xs text-white/30">
                            {isLogin ? "First time here?" : "Already have an account?"}{" "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-white hover:underline transition-all"
                            >
                                {isLogin ? "Create account" : "Log in"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
