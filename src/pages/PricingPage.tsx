import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import Footer from '../components/layout/Footer';

type BillingCycle = 'monthly' | 'annual';
type Currency = 'INR' | 'USD' | 'EUR';

interface PlanPricing {
  INR: { monthly: number; annual: number };
  USD: { monthly: number; annual: number };
  EUR: { monthly: number; annual: number };
}

interface Plan {
  id: string;
  name: string;
  description: string;
  pricing: PlanPricing;
  usageLimit: string;
  trial: string | null;
  features: string[];
  recommended: boolean;
}

const plans: Plan[] = [
  {
    id: 'essentials',
    name: 'ESSENTIALS',
    description: "For quick, single-use optimization. Test the platform's power.",
    pricing: {
      INR: { monthly: 399, annual: 3990 },
      USD: { monthly: 4.75, annual: 47.5 },
      EUR: { monthly: 4.5, annual: 45 },
    },
    usageLimit: '3 Total Analysis Uses',
    trial: null,
    features: [
      'Resume Analysis (3 uses/month)',
      'Basic Cover Letter Generation (2 attempts/month)',
      'Company Intel Brief (1 company)',
      '1 Resume Storage Slot',
      'Standard Processing (48h turnaround)',
      'Email Support (48h response)',
    ],
    recommended: false,
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    description: 'Ideal for job-specific optimization. The strategic standard.',
    pricing: {
      INR: { monthly: 599, annual: 5990 },
      USD: { monthly: 7.2, annual: 72 },
      EUR: { monthly: 6.8, annual: 68 },
    },
    usageLimit: '10 Total Analysis Uses',
    trial: '14-day',
    features: [
      'Resume Analysis (10 uses/month)',
      'Unlimited Cover Letter Editing',
      'LinkedIn Message Generator (5/month)',
      'Interview Prep Module (5 companies)',
      '3 Resume Storage Slots',
      'Priority Processing (24h turnaround)',
      'Priority Email Support (24h response)',
    ],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    description: 'For power users, coaches, and aggressive search strategies.',
    pricing: {
      INR: { monthly: 1499, annual: 14990 },
      USD: { monthly: 18, annual: 180 },
      EUR: { monthly: 17, annual: 170 },
    },
    usageLimit: 'Unlimited Analysis',
    trial: '7-day',
    features: [
      'Unlimited Resume Analysis',
      'Unlimited Cover Letter Generation with AI Rewrites',
      'Unlimited LinkedIn Messages',
      'Unlimited Interview Prep',
      'Unlimited Resume Storage',
      'Instant Processing (<1h turnaround)',
      'Email + Chat Support (1h response)',
      'Early Access to New Features',
    ],
    recommended: false,
  },
];

const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [currency, setCurrency] = useState<Currency>('INR');

    const handleSelectPlan = (planId: string) => {
        // TODO: Pass billing cycle and currency to checkout/signup
        // For now, just navigate to app
        navigate('/app', {
            state: {
                selectedPlan: planId,
                billingCycle,
                currency,
            },
        });
    };

    // Get currency symbol
    const getCurrencySymbol = (curr: Currency): string => {
        const symbols = { INR: '₹', USD: '$', EUR: '€' };
        return symbols[curr];
    };

    // Calculate displayed price
    const getDisplayPrice = (plan: Plan): number => {
        return plan.pricing[currency][billingCycle];
    };

    // Calculate effective monthly price for annual billing
    const getEffectiveMonthly = (plan: Plan): number => {
        return Math.round(plan.pricing[currency].annual / 12);
    };

    // Format price with proper decimals
    const formatPrice = (price: number, curr: Currency): string => {
        if (curr === 'INR') {
            return price.toLocaleString('en-IN'); // No decimals for INR
        }
        return price.toFixed(2); // 2 decimals for USD/EUR
    };

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

                    {/* Currency Switcher */}
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className="bg-surface-elevated border border-white/10 text-text-primary px-3 py-2 rounded text-xs font-interstate font-bold uppercase tracking-wider cursor-pointer hover:border-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                        <option value="INR">🇮🇳 INR</option>
                        <option value="USD">🇺🇸 USD</option>
                        <option value="EUR">🇪🇺 EUR</option>
                    </select>
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

                    {/* Billing Cycle Toggle */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex items-center gap-4 bg-surface-elevated p-2 rounded-lg border border-white/10">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-3 rounded-md font-interstate text-sm font-bold uppercase tracking-wider transition-all ${
                                    billingCycle === 'monthly'
                                        ? 'bg-accent text-surface-base'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-6 py-3 rounded-md font-interstate text-sm font-bold uppercase tracking-wider transition-all relative ${
                                    billingCycle === 'annual'
                                        ? 'bg-accent text-surface-base'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                Annual
                                <span className="absolute -top-2 -right-2 bg-accent text-surface-base text-[9px] font-bold px-2 py-0.5 rounded-full">
                                    Save 17%
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan) => {
                            const displayPrice = getDisplayPrice(plan);
                            const effectiveMonthly = getEffectiveMonthly(plan);
                            const currSymbol = getCurrencySymbol(currency);

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col p-8 rounded-lg border transition-all duration-300
                                        ${
                                            plan.recommended
                                                ? 'bg-surface-elevated border-accent shadow-[0_0_30px_rgba(0,255,127,0.05)] scale-105 z-10'
                                                : 'bg-surface-base border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {/* Recommended Badge */}
                                    {plan.recommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-base border border-accent text-accent px-3 py-1 rounded-full text-[10px] font-interstate font-bold uppercase tracking-widest">
                                            Most Popular
                                        </div>
                                    )}

                                    {/* Plan Name & Description */}
                                    <div className="mb-8">
                                        <h3 className="font-tiempos text-2xl font-bold mb-2">{plan.name}</h3>
                                        <p className="font-interstate text-xs text-text-secondary min-h-[40px]">
                                            {plan.description}
                                        </p>
                                    </div>

                                    {/* Pricing */}
                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-interstate text-sm text-text-secondary">{currSymbol}</span>
                                            <span className="font-tiempos text-4xl font-bold">
                                                {formatPrice(
                                                    billingCycle === 'annual' ? effectiveMonthly : displayPrice,
                                                    currency,
                                                )}
                                            </span>
                                            <span className="font-interstate text-sm text-text-secondary">/mo</span>
                                        </div>

                                        {/* Annual billing additional info */}
                                        {billingCycle === 'annual' && (
                                            <p className="mt-1 font-interstate text-[10px] text-text-secondary">
                                                Billed {currSymbol}
                                                {formatPrice(displayPrice, currency)} annually
                                            </p>
                                        )}

                                        {/* Usage Limit */}
                                        <div className="mt-3 font-interstate text-xs font-bold text-accent uppercase tracking-wide">
                                            {plan.usageLimit}
                                        </div>

                                        {/* Trial Info */}
                                        {plan.trial && (
                                            <div className="mt-2 font-interstate text-[10px] text-text-secondary">
                                                {plan.trial} free trial
                                            </div>
                                        )}
                                    </div>

                                    {/* Features List */}
                                    <div className="flex-1 mb-8">
                                        <ul className="space-y-4">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-3">
                                                    <div
                                                        className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 ${
                                                            plan.recommended
                                                                ? 'bg-accent text-surface-base'
                                                                : 'bg-white/10 text-text-secondary'
                                                        }`}
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    <span
                                                        className={`text-sm ${
                                                            plan.recommended ? 'text-text-primary' : 'text-text-secondary'
                                                        }`}
                                                    >
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        className={`w-full py-4 rounded font-interstate font-bold text-xs uppercase tracking-widest transition-all
                                            ${
                                                plan.recommended
                                                    ? 'bg-accent text-surface-base hover:bg-white'
                                                    : 'bg-white/5 text-text-primary hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {plan.trial ? `Start ${plan.trial.split('-')[0]}-Day Free Trial` : 'Select Plan'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PricingPage;
