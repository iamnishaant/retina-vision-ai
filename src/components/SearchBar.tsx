import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  title: string;
  description: string;
  category: string;
}

// Knowledge base for diabetic retinopathy
const knowledgeBase: Record<string, { answer: string; sources: string[] }> = {
  'diabetic retinopathy': {
    answer: 'Diabetic retinopathy (DR) is a diabetes complication that affects the eyes. It\'s caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina). High blood sugar levels over time damage the tiny blood vessels in the retina, causing them to leak fluid, swell, or develop abnormal new blood vessels. It\'s the leading cause of blindness in working-age adults.',
    sources: ['American Academy of Ophthalmology', 'National Eye Institute']
  },
  'what is dr': {
    answer: 'DR (Diabetic Retinopathy) is a serious eye condition affecting people with diabetes. It occurs when high blood sugar damages blood vessels in the retina, leading to vision problems and potentially blindness if untreated. There are two main stages: NPDR (Non-Proliferative) in early stages, and PDR (Proliferative) in advanced stages when abnormal blood vessels grow.',
    sources: ['WHO', 'Diabetes UK']
  },
  'symptoms': {
    answer: 'Early diabetic retinopathy often has NO symptoms, which is why regular eye exams are crucial. As it progresses, symptoms may include: floating spots or dark strings (floaters), blurred vision, fluctuating vision, dark or empty areas in vision, vision loss, and difficulty with color perception. By the time symptoms appear, significant damage may have already occurred.',
    sources: ['Mayo Clinic', 'Cleveland Clinic']
  },
  'stages': {
    answer: 'Diabetic retinopathy has 5 stages based on severity: 0) No DR - healthy retina; 1) Mild NPDR - small microaneurysms; 2) Moderate NPDR - blocked blood vessels; 3) Severe NPDR - many blocked vessels, retina signals for new vessel growth; 4) PDR (Proliferative) - abnormal new blood vessels grow, high risk of vision loss. Our AI model classifies fundus images into these 5 classes.',
    sources: ['DDR Dataset Classification', 'EyePACS Grading Scale']
  },
  'treatment': {
    answer: 'Treatment depends on the stage: Early stages may only need careful monitoring and better diabetes management. Advanced stages may require: Laser treatment (photocoagulation) to seal leaking vessels, Anti-VEGF injections to reduce swelling and prevent new vessel growth, Vitrectomy surgery to remove blood and scar tissue. Early detection through regular screening is key - treatment is most effective before vision loss occurs.',
    sources: ['American Diabetes Association', 'Royal College of Ophthalmologists']
  },
  'prevention': {
    answer: 'While you can\'t always prevent diabetic retinopathy, you can reduce your risk: Control blood sugar levels (HbA1c < 7%), Manage blood pressure and cholesterol, Get regular comprehensive eye exams (at least annually), Don\'t smoke, Exercise regularly, and Monitor vision changes. Good diabetes management can slow or prevent vision loss by up to 95%.',
    sources: ['NIH', 'Diabetes Prevention Program']
  },
  'microaneurysms': {
    answer: 'Microaneurysms are tiny bulges in the blood vessel walls of the retina - they\'re the earliest visible sign of diabetic retinopathy. These small, round, dark red dots appear when vessel walls weaken due to high blood sugar. They may leak small amounts of blood into the retina. In fundus images, they appear as small red dots, typically 15-60 micrometers in size.',
    sources: ['Ophthalmology Research', 'DDR Dataset Documentation']
  },
  'hemorrhages': {
    answer: 'Retinal hemorrhages are areas of bleeding within the retina caused by damaged blood vessels in diabetic retinopathy. They appear in fundus images as: Dot hemorrhages (deep in retina, round), Blot hemorrhages (larger, irregular), Flame-shaped hemorrhages (superficial, follow nerve fiber layer). They indicate progressing disease and potential vision threat.',
    sources: ['Journal of Ophthalmology', 'EyePACS Clinical Notes']
  },
  'hard exudates': {
    answer: 'Hard exudates are yellow-white deposits of lipids and proteins that leak from damaged blood vessels and accumulate in the retina. They appear as bright, well-defined spots in fundus images, often forming a ring pattern around areas of leakage. When they accumulate in the macula (central vision area), they can significantly impact vision.',
    sources: ['Retina Specialists', 'DDR Dataset Features']
  },
  'macula': {
    answer: 'The macula is the central area of the retina responsible for sharp, detailed central vision. It contains the highest concentration of cone photoreceptors. Diabetic Macular Edema (DME) occurs when fluid leaks into the macula, causing it to swell and distort vision. DME is the most common cause of vision loss in diabetic retinopathy and can occur at any stage.',
    sources: ['Macular Society', 'American Society of Retina Specialists']
  },
  'fundus': {
    answer: 'A fundus image is a photograph of the interior surface of the eye, including the retina, optic disc, macula, and blood vessels. Fundus photography is the primary screening method for diabetic retinopathy. Our AI model analyzes these images to detect DR features like microaneurysms, hemorrhages, and exudates, then classifies the severity from 0-4.',
    sources: ['EyePACS Imaging Protocol', 'DDR Dataset']
  },
  'ddr dataset': {
    answer: 'The DDR (Diabetic Retinopathy Detection) dataset is a large-scale dataset for DR research containing thousands of retinal fundus images. Images are graded by expert ophthalmologists into 5 classes (0-4) based on DR severity. It includes annotations for DR lesions like microaneurysms, hemorrhages, and hard exudates. We use this alongside EyePACS for training our deep learning models.',
    sources: ['DDR Official Documentation', 'Medical Image Analysis']
  },
  'eyepacs': {
    answer: 'EyePACS is a major retinal image dataset with over 88,000 high-resolution fundus images collected from screening programs. Each image is rated on a scale of 0-4 for diabetic retinopathy severity by clinicians. It\'s one of the most widely used datasets for training DR detection AI models and was featured in a famous Kaggle competition.',
    sources: ['EyePACS Inc.', 'Kaggle Diabetic Retinopathy Competition']
  },
  'npdr': {
    answer: 'NPDR (Non-Proliferative Diabetic Retinopathy) is the early stage where blood vessels in the retina are damaged but new abnormal vessels haven\'t started growing yet. Signs include microaneurysms, retinal hemorrhages, hard exudates, and cotton wool spots. It\'s classified as Mild, Moderate, or Severe based on the extent of damage. Most vision can be preserved with good diabetes control at this stage.',
    sources: ['AAO Retina Guidelines', 'International DR Classification']
  },
  'pdr': {
    answer: 'PDR (Proliferative Diabetic Retinopathy) is the advanced stage where the retina starts growing new, abnormal blood vessels (neovascularization) due to oxygen deprivation. These fragile vessels can bleed into the vitreous, cause retinal detachment, and lead to severe vision loss or blindness. Requires urgent treatment with laser therapy or anti-VEGF injections.',
    sources: ['NEI Vision Research', 'British Journal of Ophthalmology']
  },
  'deep learning': {
    answer: 'Our project uses deep learning (convolutional neural networks) to automatically detect and classify diabetic retinopathy from retinal fundus images. The pipeline: 1) Image preprocessing (quality enhancement, normalization), 2) Feature extraction using trained CNNs, 3) Classification into 5 DR severity grades. This enables faster, more accessible screening compared to manual review by ophthalmologists.',
    sources: ['Project Documentation', 'Medical AI Research']
  },
  'how does it work': {
    answer: 'Our DR detection system works in stages: 1) Upload a retinal fundus image, 2) Image preprocessing to enhance quality and normalize, 3) The preprocessed image passes through our deep learning model, 4) The model analyzes features like microaneurysms, hemorrhages, and exudates, 5) Classification output shows DR grade (0-4) with confidence scores. The model was trained on DDR and EyePACS datasets.',
    sources: ['System Architecture', 'Model Documentation']
  }
};

const quickSuggestions = [
  'What is diabetic retinopathy?',
  'What are the symptoms?',
  'How many stages does DR have?',
  'What is the macula?',
  'How does detection work?'
];

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [answer, setAnswer] = useState<{ text: string; sources: string[] } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchKnowledgeBase = (searchQuery: string): { answer: string; sources: string[] } | null => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    // Direct match
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
        return value;
      }
    }

    // Keyword matching
    const keywords: Record<string, string> = {
      'cause': 'diabetic retinopathy',
      'causes': 'diabetic retinopathy',
      'why': 'diabetic retinopathy',
      'blind': 'diabetic retinopathy',
      'vision loss': 'symptoms',
      'signs': 'symptoms',
      'blurry': 'symptoms',
      'floaters': 'symptoms',
      'treat': 'treatment',
      'cure': 'treatment',
      'laser': 'treatment',
      'injection': 'treatment',
      'prevent': 'prevention',
      'avoid': 'prevention',
      'risk': 'prevention',
      'stage': 'stages',
      'grade': 'stages',
      'class': 'stages',
      'level': 'stages',
      'mild': 'npdr',
      'moderate': 'npdr',
      'severe': 'npdr',
      'proliferative': 'pdr',
      'neovascularization': 'pdr',
      'new vessels': 'pdr',
      'microaneurysm': 'microaneurysms',
      'bleed': 'hemorrhages',
      'blood': 'hemorrhages',
      'yellow': 'hard exudates',
      'lipid': 'hard exudates',
      'central vision': 'macula',
      'macular edema': 'macula',
      'photo': 'fundus',
      'image': 'fundus',
      'retinal image': 'fundus',
      'dataset': 'ddr dataset',
      'ai': 'deep learning',
      'model': 'deep learning',
      'cnn': 'deep learning',
      'work': 'how does it work',
      'process': 'how does it work',
      'analyze': 'how does it work'
    };

    for (const [keyword, mappedKey] of Object.entries(keywords)) {
      if (normalizedQuery.includes(keyword)) {
        return knowledgeBase[mappedKey];
      }
    }

    return null;
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setIsOpen(true);
    setShowSuggestions(false);

    // Simulate search delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = searchKnowledgeBase(query);
    
    if (result) {
      setAnswer({ text: result.answer, sources: result.sources });
    } else {
      setAnswer({
        text: `I don't have specific information about "${query}" in my knowledge base. Try asking about: diabetic retinopathy basics, symptoms, stages (NPDR/PDR), treatment options, prevention, or our AI detection system. You can also explore terms like microaneurysms, hemorrhages, macula, or fundus imaging.`,
        sources: ['DRVision Knowledge Base']
      });
    }

    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const clearSearch = () => {
    setQuery('');
    setAnswer(null);
    setIsOpen(false);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (query.length > 0 && !answer) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query, answer]);

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
              onKeyDown={handleKeyDown}
              onFocus={() => !answer && setShowSuggestions(true)}
              placeholder="Ask about diabetic retinopathy, symptoms, stages, treatment..."
              className="w-full bg-transparent py-5 pl-14 pr-24 text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  onClick={clearSearch}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Ask
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Suggestions */}
      <AnimatePresence>
        {showSuggestions && !answer && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-3">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Display */}
      <AnimatePresence>
        {isOpen && (answer || isSearching) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50"
          >
            <div className="p-6">
              {isSearching ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Searching knowledge base...</span>
                </div>
              ) : answer ? (
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground leading-relaxed">{answer.text}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Sources:</span>
                    {answer.sources.map((source, index) => (
                      <span key={index} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;