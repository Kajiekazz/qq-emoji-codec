import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SEARCH_ENGINES } from './constants';
import GlassCard from './GlassCard';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeEngine, setActiveEngine] = useState(SEARCH_ENGINES[0]);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const searchUrl = `${activeEngine.url}?${activeEngine.queryParam}=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
    setQuery('');
  };

  return (
    <div className="w-full max-w-xl mx-auto relative z-20 px-4">
      <GlassCard className={`
        !rounded-full p-2 flex items-center transition-all duration-500 
        border-2 
        ${isFocused 
          ? 'border-sakura-300 dark:border-sakura-400 bg-white/80 dark:bg-night-900/80 shadow-glow dark:shadow-glow-dark' 
          : 'border-white/40 dark:border-sakura-500/20 bg-white/50 dark:bg-night-900/40'}
      `}>
        
        {/* Engine Switcher */}
        <div className="relative group px-2">
           <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-night-800/50 text-slate-600 dark:text-sakura-200 font-bold text-xs hover:bg-sakura-100 dark:hover:bg-sakura-900/50 hover:text-sakura-500 dark:hover:text-sakura-300 transition-colors">
              <span>{activeEngine.name}</span>
           </button>
           
           {/* Dropdown */}
           <div className="absolute top-full left-0 mt-4 w-32 py-2 bg-white/90 dark:bg-night-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white dark:border-sakura-500/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
              {SEARCH_ENGINES.map((engine) => (
                <button
                  key={engine.name}
                  onClick={() => setActiveEngine(engine)}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 dark:text-sakura-200 hover:bg-sakura-100 dark:hover:bg-sakura-800/50 hover:text-sakura-500 dark:hover:text-sakura-100 transition-colors"
                >
                  {engine.name}
                </button>
              ))}
           </div>
        </div>

        <div className="h-6 w-0.5 bg-slate-200 dark:bg-sakura-900/50 mx-1" />

        {/* Input */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={activeEngine.placeholder}
            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-sakura-50 placeholder-slate-500/60 dark:placeholder-sakura-300/50 px-2 text-lg font-bold"
          />
          <button 
            type="submit"
            disabled={!query.trim()}
            className={`
              p-3 rounded-full 
              text-white font-bold transition-all duration-500 ease-silk
              ${query.trim() 
                ? 'bg-sakura-400 dark:bg-sakura-500 hover:bg-sakura-500 dark:hover:bg-sakura-400 shadow-lg shadow-sakura-400/40 rotate-0 scale-100' 
                : 'bg-slate-200 dark:bg-sakura-900/30 text-slate-400 dark:text-sakura-800 -rotate-90 scale-50 opacity-0 w-0 p-0 overflow-hidden'}
            `}
          >
            <Search size={20} />
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default SearchBar;