import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from './RootLayout';
import LoadingFallback from '../components/shared/LoadingFallback';

// Lazy load route components
const LandingPage = lazy(() => import('../../components/LandingPage'));
const PricingPage = lazy(() => import('../../components/PricingPage'));
const DashboardView = lazy(() => import('./DashboardView'));
const AppView = lazy(() => import('./AppView'));
const LegalPages = lazy(() => import('../../components/LegalPages'));

// Helper to wrap components in Suspense
const withSuspense = (Component: React.ComponentType<any>, props = {}) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
    </Suspense>
);

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: '/',
                element: withSuspense(LandingPage),
            },
            {
                path: '/pricing',
                element: withSuspense(PricingPage),
            },
            {
                path: '/app',
                element: withSuspense(AppView),
            },
            {
                path: '/dashboard',
                element: withSuspense(DashboardView),
            },
            {
                path: '/terms',
                element: withSuspense(LegalPages, { view: "terms" }),
            },
            {
                path: '/privacy',
                element: withSuspense(LegalPages, { view: "privacy" }),
            },
            {
                path: '/cookie',
                element: withSuspense(LegalPages, { view: "cookie" }),
            },
            {
                path: '/about',
                element: withSuspense(LegalPages, { view: "about" }),
            },
        ],
    },
]);
