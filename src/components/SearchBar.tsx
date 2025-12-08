import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  title: string;
  description: string;
  category: string;
}

const searchData: SearchResult[] = [
  { title: 'Diabetic Retinopathy', description: 'A diabetes complication that affects the eyes', category: 'Condition' },
  { title: 'Retinal Fundus Imaging', description: 'Photography technique to capture images of the retina', category: 'Diagnosis' },
  { title: 'Macula', description: 'Central area of the retina responsible for sharp vision', category: 'Anatomy' },
  { title: 'Microaneurysms', description: 'Small bulges in blood vessels - early sign of DR', category: 'Symptoms' },
  { title: 'Hard Exudates', description: 'Yellow lipid deposits in the retina', category: 'Symptoms' },
  { title: 'Hemorrhages', description: 'Bleeding in the retina from damaged blood vessels', category: 'Symptoms' },
  { title: 'Neovascularization', description: 'Abnormal blood vessel growth in advanced DR', category: 'Symptoms' },
  { title: 'NPDR', description: 'Non-Proliferative Diabetic Retinopathy - early stage', category: 'Stages' },
  { title: 'PDR', description: 'Proliferative Diabetic Retinopathy - advanced stage', category: 'Stages' },
  { title: 'DDR Dataset', description: 'Diabetic Retinopathy Detection dataset for research', category: 'Dataset' },
  { title: 'EyePACS Dataset', description: 'Large-scale retinal image dataset for DR screening', category: 'Dataset' },
  { title: 'DR Grading Scale', description: '5-class classification system for DR severity', category: 'Classification' },
];

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative"
      >
        <div className="relative search-glow rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-gradient" />
          <div className="relative bg-card/80 backdrop-blur-xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search about diabetic retinopathy, symptoms, treatments..."
              className="w-full bg-transparent py-5 pl-14 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50"
          >
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-primary/10 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{result.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {result.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
