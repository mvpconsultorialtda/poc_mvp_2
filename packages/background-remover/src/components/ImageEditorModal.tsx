
import React, { useState, useEffect, useRef } from 'react';
import './../background-remover.css';
import { removeBackground } from '@imgly/background-removal';
import { DownloadIcon, TrashIcon, XIcon, BrushIcon, EraserIcon, UndoIcon, PictureIcon } from './icons';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, file }) => {
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string>('Removendo o fundo...');

  // --- Estados de Edição ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number, y: number } | null>(null);
  const [showCursor, setShowCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [brushPattern, setBrushPattern] = useState<CanvasPattern | null>(null);

  // Efeito principal para remoção de fundo
  useEffect(() => {
    if (!isOpen || !file) return;

    let isCancelled = false;
    const originalUrl = URL.createObjectURL(file);
    let processedUrl: string | null = null;
    
    setOriginalImageUrl(originalUrl);
    setProcessedImageUrl(null);
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setProgressMessage('Iniciando...');
    setActiveTool(null);
    setHistory([]);
    setBrushPattern(null);

    const originalImg = new Image();
    originalImg.crossOrigin = 'anonymous';
    originalImg.src = originalUrl;
    originalImg.onload = () => {
      originalImageRef.current = originalImg;
    };

    const process = async () => {
      try {
        const blob = await removeBackground(file, {
          progress: (key, current, total) => {
            if (isCancelled) return;
            const percentage = Math.round((current / total) * 100);
            setProgress(percentage);
            setProgressMessage(key.startsWith('download') ? 'Baixando modelo de IA...' : 'Removendo o fundo...');
          },
        });
        if (!isCancelled) {
          processedUrl = URL.createObjectURL(blob);
          setProcessedImageUrl(processedUrl);
        }
      } catch (e: any) {
        if (!isCancelled) setError(`Falha ao processar a imagem: ${e.message}`);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    process();

    return () => {
      isCancelled = true;
      URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [file, isOpen]);

  // Efeito para desenhar imagem processada no canvas e criar o pincel de restauração
  useEffect(() => {
    if (processedImageUrl && canvasRef.current && originalImageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = processedImageUrl;
      img.onload = () => {
        if (!ctx) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialData]);

        // Criar o padrão para o pincel de restauração
        const pattern = ctx.createPattern(originalImageRef.current!, 'no-repeat');
        setBrushPattern(pattern);
      };
    }
  }, [processedImageUrl]);

  const getCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool) return;
    const coords = getCoords(e);
    setIsDrawing(true);
    setLastPosition(coords);
    handleDrawing(coords.x, coords.y);
  };
  
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPosition(null);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev, currentData]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
    if (isDrawing && activeTool) {
      const { x, y } = getCoords(e);
      handleDrawing(x, y);
    }
  };

  const handleDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastPosition) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);

    if (activeTool === 'brush' && brushPattern) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushPattern;
        ctx.stroke();
    } else if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.stroke();
    }
    
    setLastPosition({ x, y });
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const lastState = newHistory[newHistory.length - 1];
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && lastState) {
        canvas.width = lastState.width;
        canvas.height = lastState.height;
        ctx.putImageData(lastState, 0, 0);
        setHistory(newHistory);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const imageURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imageURL;
    a.download = `${file?.name.split('.')[0]}_sem_fundo_editado.png` || 'imagem_editada.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleClose = () => onClose();

  const getScaledBrushSize = () => {
    if (!canvasRef.current) return brushSize;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return 0;
    const scaleX = canvas.width / rect.width;
    return brushSize / scaleX;
  };

  const ToolButton = ({ toolName, icon }: { toolName: 'brush' | 'eraser'; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTool(prev => prev === toolName ? null : toolName)}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTool === toolName ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
      disabled={!processedImageUrl || isLoading}
      aria-label={toolName === 'brush' ? 'Pincel de restauração' : 'Borracha'}
      aria-pressed={activeTool === toolName}
    >
      {icon}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Editor de Imagem</h2>
          <button onClick={handleClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Fechar">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Original</h3>
            <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900/50 rounded-lg flex items-center justify-center">
              {originalImageUrl ? <img src={originalImageUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-md" /> : <PictureIcon className="w-16 h-16 text-slate-400" />}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Editado</h3>
            <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900/50 rounded-lg flex items-center justify-center relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%228%22%20height%3D%228%22%3E%3Cpath%20d%3D%22M0%200h4v4H0zM4%204h4v4H4z%22%20fill%3D%22%23ccc%22%20fill-opacity%3D%220.4%22%2F%3E%3C%2Fsvg%3E')]">
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg text-white p-4">
                  <div className="w-16 h-16 border-4 border-t-sky-500 border-white/50 rounded-full animate-spin"><span className="sr-only">Carregando...</span></div>
                  <p className="mt-4 text-lg font-semibold">{progress}%</p><p className="text-sm">{progressMessage}</p>
                </div>
              )}
              {error && <p className="text-red-500 p-4">{error}</p>}
              <div 
                className="relative max-w-full max-h-full flex items-center justify-center touch-none"
                style={{ cursor: activeTool ? 'none' : 'default' }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { if(isDrawing) handleMouseUp(); setShowCursor(false); }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setShowCursor(true)}
              >
                  <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-md animate-fade-in" />
                  {showCursor && activeTool && (
                      <div 
                        className="rounded-full border-2 border-sky-500 bg-sky-500/20 pointer-events-none"
                        style={{
                            position: 'fixed',
                            left: cursorPosition.x,
                            top: cursorPosition.y,
                            width: `${getScaledBrushSize()}px`,
                            height: `${getScaledBrushSize()}px`,
                            transform: 'translate(-50%, -50%)',
                        }}
                      />
                  )}
              </div>
            </div>
          </div>
        </main>

        <div className="p-4 border-y border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center space-x-2" aria-label="Ferramentas de Edição">
                <ToolButton toolName="brush" icon={<BrushIcon className="w-5 h-5" />} />
                <ToolButton toolName="eraser" icon={<EraserIcon className="w-5 h-5" />} />
                <button onClick={handleUndo} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={history.length <= 1 || isLoading} aria-label="Desfazer">
                    <UndoIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto" aria-label="Tamanho do pincel">
                <span className="text-sm text-slate-600 dark:text-slate-400">Tamanho:</span>
                <input
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-32 accent-sky-600"
                    disabled={!processedImageUrl || isLoading}
                />
            </div>
        </div>

        <footer className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50">
          <button onClick={handleClose} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold flex items-center space-x-2">
            <TrashIcon className="w-5 h-5" /><span>Descartar</span>
          </button>
          <button onClick={handleDownload} disabled={history.length === 0 || isLoading} className="px-6 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-semibold flex items-center space-x-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
            <DownloadIcon className="w-5 h-5" /><span>Download</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ImageEditorModal;
