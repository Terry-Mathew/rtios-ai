/**
 * App.tsx - Application Root with React Router
 * 
 * Minimal router provider implementation.
 * All view logic has been moved to route components.
 */

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './src/routes';

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
