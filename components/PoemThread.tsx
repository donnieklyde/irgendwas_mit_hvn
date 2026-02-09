'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RatingControl from './RatingControl';
import AIRatingDisplay from './AIRatingDisplay';
import { RefreshCw, Plus } from 'lucide-react';

interface Poem {
    id: string;
    content: string;
    author?: {
        username?: string | null;
    } | null;
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
            const res = await fetch('/api/poems', {
                method: 'POST',
                body: JSON.stringify({
                    content: newPoemContent
                })
            });
            const createdPoem = await res.json();
            setPoem(createdPoem);
            setNewPoemContent("");
            setCreating(false);
            triggerAIRating(createdPoem.id);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative text-white">

            {/* Creation Trigger - Bottom Right */}
            {!creating && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => setCreating(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-md border border-white/20 shadow-2xl transition-all z-50 flex items-center justify-center group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
                </motion.button>
            )}

            <AnimatePresence mode="wait">
                {creating ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
                        key="create-mode"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-3xl glass-panel p-12 rounded-3xl relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setCreating(false)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>

                            <div className="flex flex-col gap-8">
                                <div className="text-center">
                                    <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">Compose</h2>
                                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
                                </div>

                                <textarea
                                    value={newPoemContent}
                                    onChange={(e) => setNewPoemContent(e.target.value)}
                                    placeholder="Let the words flow..."
                                    className="w-full h-80 bg-transparent text-3xl md:text-4xl font-serif text-center outline-none resize-none placeholder:text-white/10 text-white leading-[1.6] font-light"
                                    autoFocus
                                />

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setCreating(false)}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono uppercase tracking-widest text-xs transition-all rounded-full"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!newPoemContent.trim()}
                                        className="px-12 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-full hover:scale-105 shadow-lg shadow-white/20"
                                    >
                                        Publish
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

                            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-2">
                                <div className="text-[10px] text-white font-mono uppercase tracking-[0.2em] opacity-80">
                                    By {poem.author?.username || "Anonymous"}
                                </div>
                                <div className="text-[8px] text-white/20 font-mono uppercase tracking-[0.3em]">
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
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="glass-panel p-16 rounded-3xl max-w-md">
                            <div className="text-6xl mb-6">✨</div>
                            <p className="text-2xl font-serif font-light text-white/70 mb-4">The canvas awaits</p>
                            <p className="text-sm text-white/40 mb-8">No poems yet. Be the first to compose.</p>
                            <button
                                onClick={() => setCreating(true)}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full uppercase tracking-widest text-xs transition-all border border-white/20"
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
