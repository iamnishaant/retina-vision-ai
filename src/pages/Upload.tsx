import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, Image, X, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { toast } from 'sonner';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    toast.success('Image uploaded successfully');
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

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    toast.info('Analysis feature coming soon! Connect the FastAPI backend to enable.');
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="min-h-screen animated-bg relative">
      <AnimatedBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Analyze</span>
              <br />
              <span className="gradient-text">Retinal Images</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload a retinal fundus image for AI-powered diabetic retinopathy detection and classification.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upload Area */}
      <section className="py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`glass-card p-12 border-2 border-dashed transition-all duration-300 ${
                  isDragOver ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50'
                }`}
              >
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <UploadIcon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Drop your image here
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    or click to browse from your computer
                  </p>
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl cursor-pointer hover:shadow-[0_0_30px_rgba(79,209,197,0.4)] transition-all duration-300">
                    <Image className="h-5 w-5" />
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-muted-foreground mt-6">
                    Supported formats: JPEG, PNG, TIFF • Max size: 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-[500px] object-contain rounded-xl"
                  />
                  <button
                    onClick={clearSelection}
                    className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-destructive transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{selectedFile?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(79,209,197,0.4)] transition-all duration-300 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Start Analysis
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-16 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Image Requirements
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Format', desc: 'High-quality retinal fundus photograph' },
                { title: 'Resolution', desc: 'Minimum 512x512 pixels recommended' },
                { title: 'Quality', desc: 'Clear, well-focused image with good lighting' },
                { title: 'Type', desc: 'Color fundus photograph (CFP)' },
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Note: Connect the FastAPI backend to enable actual image processing and classification.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Upload;
