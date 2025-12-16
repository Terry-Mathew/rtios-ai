import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../../components/LandingPage';
import PricingPage from '../../components/PricingPage';
import DashboardView from './DashboardView';
import LegalPages from '../../components/LegalPages';
import AppView from './AppView';
import RootLayout from './RootLayout';

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: '/',
                element: <LandingPage />,
            },
            {
                path: '/pricing',
                element: <PricingPage />,
            },
            {
                path: '/app',
                element: <AppView />,
            },
            {
                path: '/dashboard',
                element: <DashboardView />,
            },
            {
                path: '/terms',
                element: <LegalPages view="terms" />,
            },
            {
                path: '/privacy',
                element: <LegalPages view="privacy" />,
            },
            {
                path: '/cookie',
                element: <LegalPages view="cookie" />,
            },
            {
                path: '/about',
                element: <LegalPages view="about" />,
            },
        ],
    },
]);
