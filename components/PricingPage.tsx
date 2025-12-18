
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import Footer from '../shared/layout/Footer';

const PricingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSelectPlan = (_plan: string) => {
        // Navigate to app after plan selection
        navigate('/app');
    };

    const plans = [
        {
            name: 'PULSE',
            price: '399',
            uses: '3 Total Analysis Uses',
            description: 'For quick, single-use optimization. Test the platform\'s power.',
            features: [
                'Resume Analysis Scoreboard',
                'Basic Cover Letter Gen',
                'Company Intel Brief'
            ],
            recommended: false
        },
        {
            name: 'CONTEXT',
            price: '599',
            uses: '10 Total Analysis Uses',
            description: 'Ideal for job-specific optimization. The strategic standard.',
            features: [
                'Unlimited Letter Editing',
                'Full Resume Analysis',
                'LinkedIn Message Generator',
                'Interview Prep Module',
                'Priority Processing'
            ],
            recommended: true
        },
        {
            name: 'EXECUTIVE',
            price: '1,499',
            uses: 'Unlimited Analysis',
            description: 'For power users, coaches, and aggressive search strategies.',
            features: [
                'Everything in Context',
                'Unlimited Analysis Uses',
                'Unlimited Document Storage',
                'Early Access to New Features',
                'Concierge Support'
            ],
            recommended: false
        }
    ];

    return (
        <div className="min-h-screen bg-surface-base text-text-primary font-sans flex flex-col">

            {/* Header */}
            <header className="px-6 py-6 border-b border-white/5 sticky top-0 bg-surface-base/90 backdrop-blur z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-interstate text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="font-tiempos text-xl font-bold">Rtios AI Pricing</div>
                    <div className="w-16"></div> {/* Spacer for centering */}
                </div>
            </header>

            <main className="flex-1 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="font-tiempos text-4xl md:text-5xl font-bold text-text-primary">
                            Invest in Your Narrative.
                        </h1>
                        <p className="font-interstate text-text-secondary max-w-xl mx-auto">
                            Choose the level of strategic depth that fits your current career move.
                            Transparency and value at every tier.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative flex flex-col p-8 rounded-lg border transition-all duration-300
                            ${plan.recommended
                                        ? 'bg-surface-elevated border-accent shadow-[0_0_30px_rgba(0,255,127,0.05)] scale-105 z-10'
                                        : 'bg-surface-base border-white/10 hover:border-white/20'}`}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-base border border-accent text-accent px-3 py-1 rounded-full text-[10px] font-interstate font-bold uppercase tracking-widest">
                                        Recommended
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="font-tiempos text-2xl font-bold mb-2">{plan.name}</h3>
                                    <p className="font-interstate text-xs text-text-secondary min-h-[40px]">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-interstate text-sm text-text-secondary">Rs</span>
                                        <span className="font-tiempos text-4xl font-bold">{plan.price}</span>
                                        <span className="font-interstate text-sm text-text-secondary">/mo</span>
                                    </div>
                                    <div className="mt-2 font-interstate text-xs font-bold text-accent uppercase tracking-wide">
                                        {plan.uses}
                                    </div>
                                </div>

                                <div className="flex-1 mb-8">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <div className={`mt-0.5 p-0.5 rounded-full ${plan.recommended ? 'bg-accent text-surface-base' : 'bg-white/10 text-text-secondary'}`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className={`text-sm ${plan.recommended ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.name)}
                                    className={`w-full py-4 rounded font-interstate font-bold text-xs uppercase tracking-widest transition-all
                                ${plan.recommended
                                            ? 'bg-accent text-surface-base hover:bg-white'
                                            : 'bg-white/5 text-text-primary hover:bg-white/10 border border-white/10'}`}
                                >
                                    {plan.recommended ? 'Start 14-Day Free Trial' : 'Select Plan'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PricingPage;
