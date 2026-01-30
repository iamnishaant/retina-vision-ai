import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { toast } from 'sonner';

interface PredictionResult {
  predicted_grade: string;
  confidence: number;
}

const DRGrading = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradeColors: { [key: string]: string } = {
    'Grade 0 (No DR)': 'from-green-400 to-emerald-600',
    'Grade 1 (Mild)': 'from-yellow-400 to-amber-600',
    'Grade 2 (Moderate)': 'from-orange-400 to-orange-600',
    'Grade 3 (Severe)': 'from-red-400 to-red-600',
    'Grade 4 (PDR)': 'from-purple-500 to-red-700',
  };

  const gradeDescriptions: { [key: string]: string } = {
    'Grade 0 (No DR)': 'No signs of diabetic retinopathy detected',
    'Grade 1 (Mild)': 'Only microaneurysms present',
    'Grade 2 (Moderate)': 'Microaneurysms with hemorrhages and hard exudates',
    'Grade 3 (Severe)': 'Extensive hemorrhages and cotton-wool spots',
    'Grade 4 (PDR)': 'Proliferative Diabetic Retinopathy with neovascularization',
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handlePredict = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/predict', {
        method: 'POST',
        body: formData,
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorDetail = 'Prediction failed';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch {
          // If response.json() fails, try to get text
          try {
            const text = await response.text();
            errorDetail = text || `Server error (${response.status})`;
          } catch {
            errorDetail = `Server error (${response.status})`;
          }
        }
        throw new Error(errorDetail);
      }

      // Parse successful response
      let data: PredictionResult;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error('Invalid response from server: Could not parse JSON');
      }

      setResult(data);
      toast.success('Prediction complete!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during prediction';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              DR Grading Assistant
            </h1>
            <p className="text-xl text-slate-300">
              Upload a retinal image and let AI grade the Diabetic Retinopathy level
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-500/10'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  {preview ? (
                    <>
                      <ImageIcon className="w-12 h-12 text-blue-400" />
                      <p className="text-sm text-slate-300">Image selected</p>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-12 h-12 text-slate-400" />
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-200">Drop your image here</p>
                        <p className="text-sm text-slate-400">or click to browse</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {preview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-xl overflow-hidden border border-slate-600"
                >
                  <img src={preview} alt="Preview" className="w-full h-auto" />
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePredict}
                  disabled={!selectedFile || isAnalyzing}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Predict DR Level'
                  )}
                </button>

                {selectedFile && (
                  <button
                    onClick={handleClear}
                    disabled={isAnalyzing}
                    className="px-6 py-3 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 transition-all disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex gap-3"
                >
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-300">Error</p>
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* Grade Card */}
                  <div className={`bg-gradient-to-br ${gradeColors[result.predicted_grade] || 'from-slate-600 to-slate-700'} rounded-xl p-6 text-white`}>
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold opacity-90">Prediction Result</p>
                        <h2 className="text-2xl font-bold">{result.predicted_grade}</h2>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-lg font-semibold mb-2">Confidence</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-black/30 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-white h-full transition-all duration-500"
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-2xl font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-2">About this Grade</h3>
                    <p className="text-slate-300">
                      {gradeDescriptions[result.predicted_grade] || 'Grade information not available'}
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-sm text-blue-200">
                      <span className="font-semibold">Note:</span> This is an AI-based assessment. Please consult with an ophthalmologist for clinical diagnosis and treatment.
                    </p>
                  </div>
                </motion.div>
              )}

              {!result && !isAnalyzing && !error && (
                <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-96">
                  <ImageIcon className="w-16 h-16 text-slate-500 mb-4" />
                  <p className="text-slate-400">
                    Upload an image to get started
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DRGrading;
