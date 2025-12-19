import React from 'react';
import { InterviewPrepState, JobInfo, InterviewQuestion } from '../../../../types';
import { Brain, AlertTriangle, Plus, Terminal, ArrowRight, Layers, Mic, Target, Zap, Quote, FileCheck, FileQuestion } from 'lucide-react';

interface InterviewPrepDisplayProps {
    state: InterviewPrepState;
    jobInfo: JobInfo;
    onGenerateMore: () => void;
    canGenerate: boolean;
}

const InterviewQuestionCard: React.FC<{ question: InterviewQuestion; index: number }> = ({ question, index }) => {
    return (
        <div
            className="bg-surface-elevated border border-white/5 rounded-lg mb-8 opacity-0 animate-fade-in-up relative overflow-hidden group transition-all hover:border-white/10"
            style={{ animationDelay: `${index * 150} ms`, animationFillMode: 'forwards' }}
        >
            {/* Card Header */}
            <div className="p-6 border-b border-white/5 bg-surface-base">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                        <span className={`inline - block px - 2 py - 0.5 rounded text - [9px] font - interstate uppercase tracking - widest border mb - 3
                        ${question.type === 'Behavioral' ? 'border-purple-500/30 text-purple-300 bg-purple-500/5' :
                                question.type === 'Technical' ? 'border-blue-500/30 text-blue-300 bg-blue-500/5' :
                                    'border-amber-500/30 text-amber-300 bg-amber-500/5'
                            } `}>
                            {question.type}
                        </span>
                        <h3 className="font-tiempos text-xl md:text-2xl font-bold text-text-primary leading-tight">
                            {question.question}
                        </h3>
                    </div>
                </div>

                <div className="mt-4 flex items-start gap-2">
                    <Terminal className="w-4 h-4 text-text-secondary mt-0.5" />
                    <p className="font-interstate text-xs text-text-secondary leading-relaxed">
                        <span className="font-bold text-white/40 uppercase tracking-wide mr-2">Context:</span>
                        {question.context}
                    </p>
                </div>
            </div>

            {/* Guidance Grid */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column: Structure & Leverage */}
                <div className="space-y-6">
                    <div>
                        <h4 className="flex items-center gap-2 font-interstate text-[10px] font-bold text-accent uppercase tracking-widest mb-2">
                            <Layers className="w-3 h-3" /> Recommended Structure
                        </h4>
                        <p className="text-sm text-text-primary font-sans leading-relaxed border-l border-white/10 pl-3">
                            {question.answerStructure}
                        </p>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 font-interstate text-[10px] font-bold text-accent uppercase tracking-widest mb-2">
                            <Target className="w-3 h-3" /> Resume Leverage
                        </h4>
                        <p className="text-sm text-text-primary font-sans leading-relaxed border-l border-white/10 pl-3">
                            {question.resumeLeverage}
                        </p>
                    </div>
                </div>

                {/* Right Column: Framing & Gaps */}
                <div className="space-y-6">
                    <div>
                        <h4 className="flex items-center gap-2 font-interstate text-[10px] font-bold text-accent uppercase tracking-widest mb-2">
                            <Mic className="w-3 h-3" /> Answer Framing
                        </h4>
                        <p className="text-sm text-text-primary font-sans leading-relaxed border-l border-white/10 pl-3">
                            {question.answerFraming}
                        </p>
                    </div>

                    {/* Evidence Gap - Conditional */}
                    {question.resumeGap && (
                        <div className="bg-alert-gap/5 border border-alert-gap/20 rounded p-4">
                            <h4 className="flex items-center gap-2 font-interstate text-[10px] font-bold text-alert-gap uppercase tracking-widest mb-2">
                                <AlertTriangle className="w-3 h-3" /> Evidence Gap Identified
                            </h4>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                {question.resumeGap}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategic Sample Answer Section */}
            {question.sampleAnswer && (
                <div className={`mx - 6 mb - 6 p - 6 rounded - lg border flex flex - col gap - 3 relative overflow - hidden
                ${question.sampleAnswerType === 'resume-grounded'
                        ? 'bg-accent/5 border-accent/20'
                        : 'bg-white/5 border-white/10'
                    } `}>

                    {/* Decorative Quote Icon */}
                    <Quote className={`absolute top - 4 right - 4 w - 8 h - 8 opacity - 10 
                    ${question.sampleAnswerType === 'resume-grounded' ? 'text-accent' : 'text-text-secondary'} `} />

                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text - [10px] font - interstate font - bold uppercase tracking - widest flex items - center gap - 1.5
                        ${question.sampleAnswerType === 'resume-grounded' ? 'text-accent' : 'text-text-secondary'} `}>
                            {question.sampleAnswerType === 'resume-grounded' ? <FileCheck className="w-3 h-3" /> : <FileQuestion className="w-3 h-3" />}
                            {question.sampleAnswerType === 'resume-grounded' ? 'Strategic Sample Answer (Grounded)' : 'Hypothetical Sample Answer'}
                        </span>
                    </div>

                    <div className="font-tiempos text-base text-text-primary italic leading-relaxed relative z-10">
                        {`"${question.sampleAnswer}"`}
                    </div>

                    {question.sampleAnswerType === 'hypothetical' && (
                        <p className="text-[10px] font-interstate text-text-secondary opacity-70 mt-1">
                            * This is an illustrative example of a strong answer. Your resume lacks specific evidence for this, so adapt this structure with your own relevant experience or coursework.
                        </p>
                    )}
                </div>
            )}

            {/* Cheat Code Section - Full Width */}
            {question.cheatCode && (
                <div className="bg-surface-elevated border-t border-white/5 p-6 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50"></div>

                    <h4 className="flex items-center gap-2 font-interstate text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-2">
                        <Zap className="w-3 h-3" /> Strategic Embellishment (Cheat Code)
                    </h4>

                    <p className="text-sm text-text-primary font-mono opacity-80 mb-3 leading-relaxed">
                        {question.cheatCode}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-interstate text-alert-gap border border-alert-gap/20 bg-alert-gap/5 px-2 py-1 rounded inline-flex">
                        <AlertTriangle className="w-3 h-3" />
                        <span>WARNING: Fabricated detail. Do not use without extensive preparation.</span>
                    </div>
                </div>
            )}

        </div>
    );
};

const InterviewPrepDisplay: React.FC<InterviewPrepDisplayProps> = ({
    state,
    jobInfo,
    onGenerateMore,
    canGenerate
}) => {
    const { questions, isGenerating } = state;

    return (
        <div className="h-full bg-surface-base flex flex-col overflow-hidden relative font-sans">

            {/* Header - Editorial Style */}
            <div className="bg-surface-base p-6 md:p-8 border-b border-white/10 shrink-0 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-accent/10 p-1.5 rounded">
                            <Brain className="w-5 h-5 text-accent" />
                        </div>
                        <span className="font-interstate text-xs font-bold text-accent uppercase tracking-[0.2em]">
                            Interview Intelligence
                        </span>
                    </div>
                    <h2 className="font-tiempos text-3xl md:text-4xl font-bold text-text-primary">
                        Executive Briefing
                    </h2>
                    <p className="text-text-secondary mt-2 font-light max-w-xl text-sm">
                        Targeted preparation for <span className="text-white font-medium border-b border-white/20 pb-0.5">{jobInfo.title || 'your target role'}</span> based on resume analysis.
                    </p>
                </div>

                {/* Top Action (Contextual) */}
                {questions.length > 0 && (
                    <div className="hidden md:block">
                        <span className="font-interstate text-xs text-text-secondary">
                            {questions.length} Questions Generated
                        </span>
                    </div>
                )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">

                {questions.length === 0 && !isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center border border-white/5 shadow-2xl">
                            <Brain className="w-8 h-8 text-text-secondary opacity-50" />
                        </div>
                        <div>
                            <h3 className="font-tiempos text-2xl text-text-primary mb-2">Initialize Briefing</h3>
                            <p className="font-interstate text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                                Generate a high-signal question set tailored to uncover gaps and highlight strengths.
                            </p>
                        </div>
                        <button
                            onClick={onGenerateMore}
                            disabled={!canGenerate}
                            className="group relative px-8 py-3 bg-accent text-surface-base font-interstate font-bold text-sm tracking-wide hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                GENERATE BRIEFING <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto pb-10">
                        {questions.map((q, index) => (
                            <InterviewQuestionCard key={q.id || index} question={q} index={index} />
                        ))}

                        {/* Loading State or "Generate More" */}
                        <div className="mt-12 flex justify-center pb-8">
                            {isGenerating ? (
                                <div className="flex items-center gap-3 font-interstate text-xs text-accent uppercase tracking-widest animate-pulse">
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    Processing Intelligence...
                                </div>
                            ) : (
                                <button
                                    onClick={onGenerateMore}
                                    className="group flex items-center gap-3 px-6 py-3 border border-white/20 text-text-secondary hover:text-accent hover:border-accent transition-all duration-300 font-interstate text-xs font-bold uppercase tracking-widest"
                                >
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    Add 5 Additional Questions
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewPrepDisplay;
