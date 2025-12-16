
import React from 'react';
import { View } from '../../types';

interface FooterProps {
  onNavigate: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="py-12 bg-surface-base border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
        
        {/* Copyright */}
        <div className="font-interstate text-[10px] text-text-secondary uppercase tracking-widest order-3 md:order-1">
          &copy; {new Date().getFullYear()} Rtios AI. All Rights Reserved.
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 order-1 md:order-2">
            <button onClick={() => onNavigate('terms')} className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors">
                Terms of Service
            </button>
            <button onClick={() => onNavigate('privacy')} className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors">
                Privacy Policy
            </button>
            <button onClick={() => onNavigate('cookie')} className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors">
                Cookie Policy
            </button>
        </div>

        {/* Company Links */}
        <div className="flex gap-8 order-2 md:order-3">
             <button onClick={() => onNavigate('about')} className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors">
                About
            </button>
            <button className="font-interstate text-xs text-text-secondary hover:text-text-primary transition-colors opacity-50 cursor-not-allowed">
                Contact
            </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

