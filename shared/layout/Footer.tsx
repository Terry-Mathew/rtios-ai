
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer className="py-12 bg-surface-base border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">

        {/* Copyright */}
        <div className="font-interstate text-[10px] text-text-secondary uppercase tracking-widest order-3 md:order-1">
          &copy; {new Date().getFullYear()} Rtios AI. All Rights Reserved.
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 order-1 md:order-2">
          <button onClick={() => navigate('/terms')} className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors">
            Terms of Service
          </button>
          <button onClick={() => navigate('/privacy')} className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => navigate('/cookie')} className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors">
            Cookie Policy
          </button>
        </div>

        {/* Company Links */}
        <div className="flex gap-8 order-2 md:order-3">
          <button onClick={() => navigate('/about')} className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors">
            About
          </button>
          <button
            disabled
            aria-disabled="true"
            className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors opacity-50 cursor-not-allowed"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

