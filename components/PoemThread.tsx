'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RatingControl from './RatingControl';
import { RefreshCw, Plus, Minus, MoveRight } from 'lucide-react';

interface Poem {
    id: string;
    content: string;
    author?: {
        username?: string | null;
    } | null;
    ratings: { value: number, userId: string }[];
    createdAt: string;
}

export default function PoemThread() {
    const [poem, setPoem] = useState<Poem | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newPoemContent, setNewPoemContent] = useState("");
    const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success'>('idle');

    const fetchPoem = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/poems');
            const data = await res.json();
            if (data.poem) {
                setPoem(data.poem);
            } else {
                setPoem(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPoem();
    }, [fetchPoem]);

    const handleRate = async (value: number) => {
        if (!poem) return;
        try {
            await fetch('/api/ratings', {
                method: 'POST',
                body: JSON.stringify({
                    poemId: poem.id,
                    value
                })
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async () => {
        if (!newPoemContent.trim()) return;
        setPublishStatus('publishing');
        try {
            const res = await fetch('/api/poems', {
                method: 'POST',
                body: JSON.stringify({
                    content: newPoemContent
                })
            });
            const createdPoem = await res.json();

            setPublishStatus('success');
            setTimeout(() => {
                setPoem(createdPoem);
                setNewPoemContent("");
                setCreating(false);
                setPublishStatus('idle');
            }, 800);
        } catch (e) {
            console.error(e);
            setPublishStatus('idle');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-12 relative text-white font-inter">

            {/* Header / Branding */}
            <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 text-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold block mb-1">HVN</span>
                <div className="h-px w-8 bg-white/10 mx-auto" />
            </div>

            {/* Creation Trigger */}
            {!creating && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setCreating(true)}
                    className="fixed bottom-12 right-12 md:bottom-16 md:right-16 w-14 h-14 md:w-16 md:h-16 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-all z-50 shadow-2xl group border-white/20"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </motion.button>
            )}

            <AnimatePresence mode="wait">
                {creating ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 md:p-12"
                        key="create-mode"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 20 }}
                            className="w-full max-w-4xl glass-panel p-10 md:p-20 rounded-[40px] relative overflow-hidden"
                        >
                            {/* Decorative background element */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            {/* Close Button */}
                            <button
                                onClick={() => setCreating(false)}
                                className="absolute top-8 right-8 w-12 h-12 rounded-full hover:bg-white/10 transition-all flex items-center justify-center border border-white/5"
                            >
                                <Minus className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col gap-12">
                                <div className="text-center">
                                    <h2 className="text-[9px] uppercase tracking-[0.4em] text-white/30 mb-2">The Canvas Awaits</h2>
                                    <div className="h-px w-12 bg-white/10 mx-auto" />
                                </div>

                                <textarea
                                    value={newPoemContent}
                                    onChange={(e) => setNewPoemContent(e.target.value)}
                                    placeholder="Enter the void..."
                                    className="w-full h-[400px] md:h-[500px] bg-transparent text-4xl md:text-5xl lg:text-6xl font-playfair text-center outline-none resize-none placeholder:text-white/5 text-white leading-tight font-light caret-white focus:placeholder:text-transparent transition-all"
                                    autoFocus
                                />

                                <div className="flex justify-center items-center gap-8">
                                    <button
                                        onClick={() => setCreating(false)}
                                        className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-all font-bold"
                                    >
                                        Discard
                                    </button>

                                    <button
                                        onClick={handleCreate}
                                        disabled={!newPoemContent.trim() || publishStatus !== 'idle'}
                                        className="group flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all disabled:opacity-20 shadow-xl shadow-white/5"
                                    >
                                        {publishStatus === 'publishing' ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : publishStatus === 'success' ? (
                                            "Sent into Ether"
                                        ) : (
                                            <>
                                                Release
                                                <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="loader"
                        className="flex flex-col items-center gap-4"
                    >
                        <RefreshCw className="animate-spin text-white/20 w-8 h-8" />
                        <span className="text-[8px] uppercase tracking-[0.5em] text-white/20">Summoning Verses</span>
                    </motion.div>
                ) : poem ? (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        key={poem.id}
                        className="flex flex-col items-center w-full max-w-5xl"
                    >
                        {/* Poem Display */}
                        <div className="glass-panel p-16 md:p-24 lg:p-32 rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] w-full relative group">
                            <div className="absolute top-12 left-12 opacity-5 text-8xl font-playfair pointer-events-none">"</div>

                            <p className="text-5xl md:text-7xl lg:text-8xl font-playfair font-light leading-[1.2] text-center whitespace-pre-wrap text-white selection:bg-white selection:text-black">
                                {poem.content}
                            </p>

                            <div className="mt-20 flex flex-col items-center gap-4">
                                <div className="h-px w-16 bg-white/10" />
                                <div className="flex items-center gap-6">
                                    <div className="text-[10px] text-white/60 font-bold uppercase tracking-[0.2em]">
                                        {poem.author?.username || "Anonymous"}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                    <div className="text-[9px] text-white/20 tracking-[0.3em] font-medium">
                                        {new Date(poem.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rating Control Section */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-24 w-full flex flex-col items-center gap-12"
                        >
                            <div className="text-[8px] uppercase tracking-[0.5em] text-white/20">Acknowledge</div>
                            <RatingControl
                                poemId={poem.id}
                                onRate={handleRate}
                            />
                        </motion.div>

                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="glass-panel p-20 md:p-32 rounded-[50px] max-w-xl">
                            <div className="text-8xl mb-12 opacity-40">✦</div>
                            <h3 className="text-3xl font-playfair font-light mb-6 tracking-wide">The Sanctuary is Empty</h3>
                            <p className="text-sm text-white/30 mb-12 font-medium tracking-widest uppercase">Be the one to break the silence</p>
                            <button
                                onClick={() => setCreating(true)}
                                className="px-16 py-5 bg-white text-black rounded-full uppercase tracking-[0.3em] text-[10px] font-bold hover:scale-105 transition-all"
                            >
                                Begin
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
