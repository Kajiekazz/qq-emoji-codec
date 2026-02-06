import React from 'react';
import { LINKS } from './constants';
import GlassCard from './GlassCard';
import { ExternalLink } from 'lucide-react';

const LinkGrid: React.FC = () => {
  // Since we only have 4 items, we display all of them without category filtering to keep it clean.
  const filteredLinks = LINKS;

  return (
    <div className="w-full">
      {/* Dense Grid - 2x2 for 4 items looks balanced */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <GlassCard 
              key={link.id}
              hoverEffect={true}
              className="group p-4 flex flex-col items-center justify-center gap-3 text-center h-36 !rounded-3xl transition-all !bg-white/40 dark:!bg-night-900/40"
              onClick={() => window.open(link.url, '_blank')}
            >
              <div className={`
                p-3 rounded-2xl 
                bg-white/50 dark:bg-night-800/50 
                shadow-sm dark:shadow-none
                text-${link.color} dark:text-sakura-300
                group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 ease-silk
              `}>
                <Icon size={24} />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-700/90 dark:text-sakura-100 group-hover:text-sakura-500 dark:group-hover:text-sakura-300 transition-colors">
                  {link.title}
                </h3>
                {/* Description hidden on small cards for cleaner look */}
                <p className="text-[10px] font-bold text-slate-500/80 dark:text-sakura-400/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {link.description}
                </p>
              </div>
              
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                 <ExternalLink size={14} className="text-sakura-400 dark:text-sakura-300" />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default LinkGrid;