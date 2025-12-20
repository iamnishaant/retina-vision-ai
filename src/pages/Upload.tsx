import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  const [vesselMaskSrc, setVesselMaskSrc] = useState<string | null>(null);
  const [vesselDensityValue, setVesselDensityValue] = useState<number | null>(null);
    const [croppedSrc, setCroppedSrc] = useState<string | null>(null);
    const [equalizedSrc, setEqualizedSrc] = useState<string | null>(null);
    const [resizedSrc, setResizedSrc] = useState<string | null>(null);
  const prevMaskObjectUrlRef = useRef<string | null>(null);

  const getBaseName = (name?: string) => {
    if (!name) return 'image';
    return name.replace(/\.[^/.]+$/, '');
  };

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
    if (!preview || !selectedFile) {
      toast.error('Please upload an image first');
      return;
    }

    // Run client-side preprocessing (approximate pipeline)
    setIsAnalyzing(true);
    console.log('Starting preprocessing for uploaded image');
    runPreprocessing(preview as string)
      .then(async ({ originalDataUrl, croppedDataUrl, equalizedDataUrl, resizedDataUrl, processedDataUrl, vesselMaskCanvas, vesselDensity }) => {
        console.log('runPreprocessing finished, density=', vesselDensity, 'maskCanvas=', vesselMaskCanvas);
        // Update processed preview and vessel density state
        // original preview remains as `preview` (uploaded). Store intermediate phases
        setCroppedSrc(croppedDataUrl);
        setEqualizedSrc(equalizedDataUrl);
        setResizedSrc(resizedDataUrl);
        setPreview(processedDataUrl);
        setVesselDensityValue(vesselDensity);

        // Try to export mask to dataURL; if that fails (tainted canvas), use blob URL
        try {
          const dataUrl = vesselMaskCanvas.toDataURL('image/png');
          setVesselMaskSrc(dataUrl);
        } catch (err) {
          console.warn('toDataURL failed, falling back to toBlob', err);
          try {
            await new Promise<void>((resolve) => {
              vesselMaskCanvas.toBlob((blob) => {
                if (blob) {
                  // revoke previous blob URL if any
                  if (prevMaskObjectUrlRef.current) {
                    try { URL.revokeObjectURL(prevMaskObjectUrlRef.current); } catch {}
                    prevMaskObjectUrlRef.current = null;
                  }
                  const url = URL.createObjectURL(blob);
                  prevMaskObjectUrlRef.current = url;
                  setVesselMaskSrc(url);
                }
                resolve();
              });
            });
          } catch (e) {
            console.error('Failed to export vessel mask canvas via blob:', e);
            setVesselMaskSrc(null);
          }
        }

        toast.success(`Preprocessing complete — vessel density: ${(vesselDensity * 100).toFixed(2)}%`);
      })
      .catch((err) => {
        console.error('Preprocessing pipeline error:', err);
        toast.error('Preprocessing failed — see console for details');
      })
      .finally(() => setIsAnalyzing(false));
  };

  // -------------------- Client-side preprocessing --------------------
  async function runPreprocessing(dataUrl: string) {
    // Returns processed image (384x384) and vessel mask canvas and vessel density
    console.log('runPreprocessing: start');
    let img: HTMLImageElement;
    try {
      console.log('runPreprocessing: loading image');
      img = await loadImage(dataUrl);
      console.log('runPreprocessing: image loaded', { width: img.naturalWidth, height: img.naturalHeight });
    } catch (e) {
      console.error('runPreprocessing: loadImage failed', e);
      throw new Error('loadImage failed: ' + (e instanceof Error ? e.message : String(e)));
    }

    let cropped: { canvas: HTMLCanvasElement; width: number; height: number };
    try {
      console.log('runPreprocessing: retinaCropCanvas');
      cropped = retinaCropCanvas(img, 10);
      console.log('runPreprocessing: cropped', { width: cropped.width, height: cropped.height });
    } catch (e) {
      console.error('runPreprocessing: retinaCropCanvas failed', e);
      throw new Error('retinaCropCanvas failed: ' + (e instanceof Error ? e.message : String(e)));
    }

    let equalized: HTMLCanvasElement;
    try {
      console.log('runPreprocessing: equalizeGreenChannel');
      equalized = equalizeGreenChannel(cropped.canvas, cropped.width, cropped.height);
    } catch (e) {
      console.error('runPreprocessing: equalizeGreenChannel failed', e);
      throw new Error('equalizeGreenChannel failed: ' + (e instanceof Error ? e.message : String(e)));
    }

    let resized: HTMLCanvasElement;
    try {
      console.log('runPreprocessing: resizeCanvas to 384x384');
      resized = resizeCanvas(equalized, 384, 384);
    } catch (e) {
      console.error('runPreprocessing: resizeCanvas failed', e);
      throw new Error('resizeCanvas failed: ' + (e instanceof Error ? e.message : String(e)));
    }

    let maskCanvas: HTMLCanvasElement;
    let density: number;
    try {
      console.log('runPreprocessing: computeVesselMask');
      const res = computeVesselMask(resized);
      maskCanvas = res.maskCanvas;
      density = res.density;
      console.log('runPreprocessing: computed vessel mask, density=', density);
    } catch (e) {
      console.error('runPreprocessing: computeVesselMask failed', e);
      throw new Error('computeVesselMask failed: ' + (e instanceof Error ? e.message : String(e)));
    }

    let croppedDataUrl = null;
    let equalizedDataUrl = null;
    let resizedDataUrl = null;
    try {
      croppedDataUrl = cropped.canvas.toDataURL('image/png');
    } catch (e) {
      console.warn('toDataURL failed for cropped canvas', e);
      // allow fallback later
    }
    try {
      equalizedDataUrl = equalized.toDataURL('image/png');
    } catch (e) {
      console.warn('toDataURL failed for equalized canvas', e);
    }
    try {
      resizedDataUrl = resized.toDataURL('image/png');
    } catch (e) {
      console.warn('toDataURL failed for resized canvas', e);
    }

    return {
      originalDataUrl: dataUrl,
      croppedDataUrl,
      equalizedDataUrl,
      resizedDataUrl,
      processedDataUrl: resizedDataUrl || null,
      vesselMaskCanvas: maskCanvas,
      vesselDensity: density,
    };

    return {
      originalDataUrl,
      croppedDataUrl,
      equalizedDataUrl,
      resizedDataUrl,
      processedDataUrl: resizedDataUrl,
      vesselMaskCanvas: maskCanvas,
      vesselDensity: density,
    };

    return {
      processedDataUrl: resized.toDataURL('image/png'),
      vesselMaskCanvas: maskCanvas,
      vesselDensity: density,
    };
  }

  function loadImage(dataUrl: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  function createCanvas(w: number, h: number) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function retinaCropCanvas(img: HTMLImageElement, thresh = 10) {
    const c = createCanvas(img.naturalWidth, img.naturalHeight);
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const id = ctx.getImageData(0, 0, c.width, c.height);
    const data = id.data;
    let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = (0.299 * r + 0.587 * g + 0.114 * b);
        if (gray > thresh) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    // Fallback to whole image if nothing found
    if (maxX <= minX || maxY <= minY) {
      return { canvas: c, width: c.width, height: c.height };
    }
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const out = createCanvas(w, h);
    const outCtx = out.getContext('2d')!;
    outCtx.putImageData(ctx.getImageData(minX, minY, w, h), 0, 0);
    return { canvas: out, width: w, height: h };
  }

  function equalizeGreenChannel(canvas: HTMLCanvasElement, w: number, h: number) {
    // Apply histogram equalization on green channel to boost vessel contrast (approximate CLAHE)
    const ctx = canvas.getContext('2d')!;
    const id = ctx.getImageData(0, 0, w, h);
    const data = id.data;
    const hist = new Uint32Array(256);
    for (let i = 0; i < data.length; i += 4) hist[data[i + 1]]++;
    // cumulative
    const cdf = new Uint32Array(256);
    cdf[0] = hist[0];
    for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];
    const total = w * h;
    const lut = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) lut[i] = Math.round((cdf[i] - cdf[0]) / (total - cdf[0]) * 255);
    for (let i = 0; i < data.length; i += 4) {
      data[i + 1] = lut[data[i + 1]]; // green channel
    }
    ctx.putImageData(id, 0, 0);
    return canvas;
  }

  function resizeCanvas(src: HTMLCanvasElement, tw: number, th: number) {
    const out = createCanvas(tw, th);
    const ctx = out.getContext('2d')!;
    ctx.drawImage(src, 0, 0, tw, th);
    return out;
  }

  function computeVesselMask(canvas: HTMLCanvasElement) {
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d')!;
    const id = ctx.getImageData(0, 0, w, h);
    const data = id.data;
    // extract green channel and compute simple sobel gradient magnitude
    const gray = new Float32Array(w * h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) gray[p] = data[i + 1];
    const sobel = new Float32Array(w * h);
    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let sx = 0, sy = 0;
        let idx = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const val = gray[(y + ky) * w + (x + kx)];
            sx += val * gx[idx];
            sy += val * gy[idx];
            idx++;
          }
        }
        sobel[y * w + x] = Math.hypot(sx, sy);
      }
    }
    // normalize and threshold
    let maxv = 0;
    for (let i = 0; i < sobel.length; i++) if (sobel[i] > maxv) maxv = sobel[i];
    const mask = new Uint8ClampedArray(w * h);
    let count = 0;
    const thresh = Math.max(12, maxv * 0.12);
    for (let i = 0; i < sobel.length; i++) {
      if (sobel[i] > thresh) {
        mask[i] = 255;
        count++;
      } else mask[i] = 0;
    }
    const maskCanvas = createCanvas(w, h);
    const mctx = maskCanvas.getContext('2d')!;
    const maskId = mctx.createImageData(w, h);
    for (let i = 0, p = 0; i < maskId.data.length; i += 4, p++) {
      const v = mask[p];
      maskId.data[i] = v;
      maskId.data[i + 1] = v;
      maskId.data[i + 2] = v;
      maskId.data[i + 3] = 255;
    }
    mctx.putImageData(maskId, 0, 0);
    const density = count / (w * h);
    return { maskCanvas, density };
  }

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  // Convert data URL to Blob
  const dataURLToBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  // Download a ZIP containing all available phase images + a CSV manifest
  const downloadAllZip = async () => {
    try {
      const haveAny = preview || croppedSrc || equalizedSrc || resizedSrc || vesselMaskSrc;
      if (!haveAny) {
        toast.error('No processed images available to download');
        return;
      }
      toast('Preparing ZIP...', { icon: '📦' });

      // dynamic import to avoid top-level bundling issues
      // @ts-ignore
      const JSZipModule = await import('jszip');
      // @ts-ignore
      const JSZip = JSZipModule.default || JSZipModule;
      const zip = new JSZip();

      const base = getBaseName(selectedFile?.name);
      const manifestRows: Array<string> = ['filename,phase,bytes'];

      const pushFile = async (dataUrl: string | null, filename: string, phase: string) => {
        if (!dataUrl) return;
        const blob = dataURLToBlob(dataUrl);
        zip.file(filename, blob);
        manifestRows.push(`${filename},${phase},${blob.size}`);
      };

      await pushFile(preview, `${base}_original.png`, 'original');
      await pushFile(croppedSrc, `${base}_cropped.png`, 'cropped');
      await pushFile(equalizedSrc, `${base}_equalized.png`, 'equalized');
      await pushFile(resizedSrc, `${base}_resized_384.png`, 'resized_384');
      await pushFile(vesselMaskSrc, `${base}_vessel_mask.png`, 'vessel_mask');

      // add manifest CSV
      zip.file('manifest.csv', manifestRows.join('\n'));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}_preprocessing.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success('ZIP ready — download started');
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      toast.error('Failed to create ZIP — see console');
    }
  };

  return (
    <div className="min-h-screen animated-bg relative pt-20">
      <AnimatedBackground />
      <Navbar />
      <div className="flex justify-between px-6 pt-6">
        <Link to="/results" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition">Previous</Link>
        <Link to="/project-overview" className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg hover:scale-105 transition">Next</Link>
      </div>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
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
                <div className="mt-4">
                  <h4 className="font-semibold mb-3">Preprocessing Phases</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/10 rounded-lg">
                      <div className="text-sm font-medium mb-2">Original Upload</div>
                      <div className="w-full h-40 bg-black rounded overflow-hidden flex items-center justify-center">
                        {preview ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src={preview} alt="Original" className="object-contain max-h-full" />
                            <div className="mt-2">
                              <a className="inline-block px-3 py-1 text-sm bg-slate-800 text-white rounded" href={preview} download={selectedFile?.name ?? 'original.png'}>Download Original</a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No image</div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/10 rounded-lg">
                      <div className="text-sm font-medium mb-2">Cropped Retina</div>
                      <div className="w-full h-40 bg-black rounded overflow-hidden flex items-center justify-center">
                        {croppedSrc ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src={croppedSrc} alt="Cropped" className="object-contain max-h-full" />
                            <div className="mt-2">
                              <a className="inline-block px-3 py-1 text-sm bg-slate-800 text-white rounded" href={croppedSrc} download={`${getBaseName(selectedFile?.name)}_cropped.png`}>Download Cropped</a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Not computed</div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/10 rounded-lg">
                      <div className="text-sm font-medium mb-2">Green Equalized</div>
                      <div className="w-full h-40 bg-black rounded overflow-hidden flex items-center justify-center">
                        {equalizedSrc ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src={equalizedSrc} alt="Equalized" className="object-contain max-h-full" />
                            <div className="mt-2">
                              <a className="inline-block px-3 py-1 text-sm bg-slate-800 text-white rounded" href={equalizedSrc} download={`${getBaseName(selectedFile?.name)}_equalized.png`}>Download Equalized</a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Not computed</div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/10 rounded-lg">
                      <div className="text-sm font-medium mb-2">Resized 384×384</div>
                      <div className="w-full h-40 bg-black rounded overflow-hidden flex items-center justify-center">
                        {resizedSrc ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src={resizedSrc} alt="Resized" className="object-contain max-h-full" />
                            <div className="mt-2">
                              <a className="inline-block px-3 py-1 text-sm bg-slate-800 text-white rounded" href={resizedSrc} download={`${getBaseName(selectedFile?.name)}_resized_384.png`}>Download Resized</a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Not computed</div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/10 rounded-lg col-span-full sm:col-span-2 lg:col-span-1">
                      <div className="text-sm font-medium mb-2">Vessel Mask</div>
                      <div className="w-full h-40 bg-black rounded overflow-hidden flex items-center justify-center">
                        {vesselMaskSrc ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src={vesselMaskSrc} alt="Vessel mask" className="object-contain max-h-full" />
                            <div className="mt-2 flex items-center gap-3">
                              <a className="inline-block px-3 py-1 text-sm bg-slate-800 text-white rounded" href={vesselMaskSrc} download={`${getBaseName(selectedFile?.name)}_vessel_mask.png`}>Download Mask</a>
                              <div className="text-sm text-slate-600">Density: {vesselDensityValue !== null ? `${(vesselDensityValue * 100).toFixed(2)}%` : '—'}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No vessel mask yet</div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{vesselDensityValue !== null ? `Vessel density: ${(vesselDensityValue * 100).toFixed(2)}%` : ''}</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/5 rounded-lg">
                    <h5 className="font-medium mb-2">Image Details</h5>
                    <div className="text-sm text-slate-700">
                      <div><strong>Filename:</strong> {selectedFile?.name ?? '—'}</div>
                      <div><strong>Size:</strong> {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '—'}</div>
                      <div><strong>Processed Size:</strong> {resizedSrc ? '384 × 384' : '—'}</div>
                      <div><strong>Vessel Density:</strong> {vesselDensityValue !== null ? `${(vesselDensityValue * 100).toFixed(3)}%` : '—'}</div>
                      <div className="mt-3 flex items-center gap-3">
                        {preview && <a className="inline-block px-3 py-1 bg-indigo-600 text-white rounded text-sm" href={preview} download={selectedFile?.name ?? 'original.png'}>Download Original</a>}
                        {croppedSrc && <a className="inline-block px-3 py-1 bg-slate-800 text-white rounded text-sm" href={croppedSrc} download={`${getBaseName(selectedFile?.name)}_cropped.png`}>Download Cropped</a>}
                        {equalizedSrc && <a className="inline-block px-3 py-1 bg-slate-800 text-white rounded text-sm" href={equalizedSrc} download={`${getBaseName(selectedFile?.name)}_equalized.png`}>Download Equalized</a>}
                        {resizedSrc && <a className="inline-block px-3 py-1 bg-slate-800 text-white rounded text-sm" href={resizedSrc} download={`${getBaseName(selectedFile?.name)}_resized_384.png`}>Download Resized</a>}
                        {vesselMaskSrc && <a className="inline-block px-3 py-1 bg-emerald-600 text-white rounded text-sm" href={vesselMaskSrc} download={`${getBaseName(selectedFile?.name)}_vessel_mask.png`}>Download Mask</a>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{selectedFile?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(79,209,197,0.4)] transition-all duration-300 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Start Preprocessing
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={downloadAllZip}
                      disabled={!(preview || croppedSrc || equalizedSrc || resizedSrc || vesselMaskSrc)}
                      className="px-4 py-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50"
                    >
                      Download All (ZIP)
                    </button>

                    {vesselMaskSrc && (
                      <a
                        id="download-mask"
                        href={vesselMaskSrc}
                        download="vessel_mask.png"
                        className="px-4 py-3 bg-secondary text-secondary-foreground rounded-xl"
                      >
                        Download Mask
                      </a>
                    )}
                  </div>
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
