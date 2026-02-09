'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RatingControl from './RatingControl';
import AIRatingDisplay from './AIRatingDisplay';
import { RefreshCw, Plus } from 'lucide-react';

interface Poem {
    id: string;
    content: string;
    author: {
        email: string;
    };
    ratings: { value: number, userId: string }[];
    aiRating?: {
        value: number;
        analysis: string;
    } | null;
    createdAt: string;
}

export default function PoemThread() {
    const [poem, setPoem] = useState<Poem | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newPoemContent, setNewPoemContent] = useState("");

    const fetchPoem = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch latest or random (currently API just gets latest)
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
            // Optimistic update (optional, but good for UX)
            // For now just sending request
            await fetch('/api/ratings', {
                method: 'POST',
                body: JSON.stringify({
                    poemId: poem.id,
                    value,
                    userEmail: "test@user.com" // simplified auth
                })
            });

            // Refresh to see updated ratings/AI stats if any logic depends on it
            // Or just trigger AI rating if not present
            if (!poem.aiRating) {
                triggerAIRating(poem.id);
            }

        } catch (e) {
            console.error(e);
        }
    };

    const triggerAIRating = async (poemId: string) => {
        try {
            const res = await fetch('/api/ai-rate', {
                method: 'POST',
                body: JSON.stringify({ poemId })
            });
            const aiData = await res.json();
            setPoem(prev => prev ? { ...prev, aiRating: aiData } : null);
        } catch (e) {
            console.error(e);
        }
    }

    const handleCreate = async () => {
        if (!newPoemContent.trim()) return;
        try {
            setCreating(true);
            const res = await fetch('/api/poems', {
                method: 'POST',
                body: JSON.stringify({
                    content: newPoemContent,
                    authorEmail: 'test@user.com' // simplified
                })
            });
            const createdPoem = await res.json();
            setPoem(createdPoem); // Show new poem immediately
            setNewPoemContent("");
            setCreating(false);
            // Trigger AI immediately
            triggerAIRating(createdPoem.id);
        } catch (e) {
            console.error(e);
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative text-white">

            {/* Creation Overlay Trigger */}
            <button
                onClick={() => setCreating(!creating)}
                className="fixed top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50 glass-panel border-none"
            >
                <Plus className={creating ? "rotate-45 transition-transform" : "transition-transform"} />
            </button>

            <AnimatePresence mode="wait">
                {creating ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl flex flex-col gap-6 items-center relative z-40 glass-panel p-10 rounded-2xl"
                        key="create-mode"
                    >
                        <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">New Composition</h2>
                        <textarea
                            value={newPoemContent}
                            onChange={(e) => setNewPoemContent(e.target.value)}
                            placeholder="Write your verse..."
                            className="w-full h-64 bg-transparent text-2xl md:text-3xl font-serif text-center outline-none resize-none placeholder:text-white/10 text-white p-4 leading-relaxed"
                            autoFocus
                        />
                        <button
                            onClick={handleCreate}
                            disabled={!newPoemContent.trim()}
                            className="px-10 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 disabled:opacity-50 transition-all rounded-full hover:scale-105"
                        >
                            Publish
                        </button>
                    </motion.div>
                ) : loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="loader"
                    >
                        <RefreshCw className="animate-spin text-white/20" />
                    </motion.div>
                ) : poem ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        key={poem.id}
                        className="flex flex-col items-center w-full max-w-4xl"
                    >
                        {/* Poem Content */}
                        <div className="glass-panel p-12 md:p-16 rounded-3xl shadow-2xl w-full mb-16">
                            <p className="text-4xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.4] text-center whitespace-pre-wrap text-balance text-white">
                                {poem.content}
                            </p>

                            <div className="mt-10 pt-8 border-t border-white/5 text-center">
                                <div className="text-[9px] text-white/20 font-mono uppercase tracking-[0.3em]">
                                    {new Date(poem.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Ratings Section */}
                        <div className="flex flex-col items-center gap-16 w-full max-w-2xl">
                            <RatingControl
                                poemId={poem.id}
                                onRate={handleRate}
                            />

                            {poem.aiRating && (
                                <div className="w-full border-t border-white/5 pt-16">
                                    <AIRatingDisplay
                                        value={poem.aiRating.value}
                                        analysis={poem.aiRating.analysis}
                                    />
                                </div>
                            )}
                        </div>

                    </motion.div>
                ) : (
                    <div className="text-white/50 text-center font-serif italic text-xl">
                        <p>The void is empty.</p>
                        <button onClick={() => setCreating(true)} className="mt-4 text-white hover:text-gray-300 underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all">Create the first thread</button>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
