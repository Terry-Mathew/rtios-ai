import React, { useState } from 'react';
import { CoverLetterState, ToneType } from '../../../../types';
import { Copy, Download, RefreshCw, Check, PenTool } from 'lucide-react';
import { downloadText } from '../../../../utils/fileUtils';

interface CoverLetterDisplayProps {
    state: CoverLetterState;
    onUpdateContent: (text: string) => void;
    onRegenerate: (tone: ToneType) => void;
}

const CoverLetterDisplay: React.FC<CoverLetterDisplayProps> = ({ state, onUpdateContent, onRegenerate }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(state.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        downloadText('cover-letter.txt', state.content);
    };

    const wordCount = state.content.trim().split(/\s+/).length;

    return (
        <div className="flex flex-col h-full bg-surface-base relative overflow-hidden font-sans">

            {/* Editorial Toolbar */}
            <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 z-10 bg-surface-base">

                {/* Tone Selector - Editorial Style */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="font-interstate text-[10px] uppercase tracking-widest text-text-secondary mb-1">
                            Voice & Tone
                        </span>
                        <div className="relative">
                            <select
                                value={state.tone}
                                onChange={(e) => onRegenerate(e.target.value as ToneType)}
                                disabled={state.isGenerating}
                                className="appearance-none bg-surface-elevated border border-white/10 rounded px-3 py-1.5 pr-8 text-sm font-interstate text-accent font-medium focus:outline-none focus:border-accent cursor-pointer hover:border-white/30 transition-colors"
                            >
                                {Object.values(ToneType).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <PenTool className="w-3 h-3 text-text-secondary" />
                            </div>
                        </div>
                    </div>
                    {state.isGenerating && (
                        <div className="flex items-center gap-2 text-xs font-interstate text-text-secondary animate-pulse mt-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                            Refining Draft...
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors group"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded transition-colors group"
                        title="Download as Text"
                    >
                        <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => onRegenerate(state.tone)}
                        disabled={state.isGenerating}
                        className="p-2 text-text-secondary hover:text-accent hover:bg-white/5 rounded transition-colors disabled:opacity-30 group"
                        title="Regenerate"
                    >
                        <RefreshCw className={`w - 4 h - 4 group - hover: rotate - 180 transition - transform duration - 500 ${state.isGenerating ? 'animate-spin' : ''} `} />
                    </button>
                </div>
            </div>

            {/* Editor Surface */}
            <div className="flex-1 relative bg-surface-base">
                <textarea
                    className="w-full h-full p-8 md:p-12 resize-none focus:outline-none text-text-primary leading-[1.8] font-tiempos text-lg md:text-xl bg-surface-base placeholder:text-white/10 custom-scrollbar selection:bg-accent/30"
                    value={state.content}
                    onChange={(e) => onUpdateContent(e.target.value)}
                    placeholder="Generated narrative will appear here..."
                    spellCheck={false}
                />

                {/* Word Count Floating Label */}
                <div className="absolute bottom-4 right-6 font-interstate text-[10px] text-text-secondary/50 tracking-widest bg-surface-base/80 backdrop-blur px-2 py-1 rounded border border-white/5">
                    {state.content ? wordCount : 0} WORDS
                </div>
            </div>
        </div>
    );
};

export default CoverLetterDisplay;
