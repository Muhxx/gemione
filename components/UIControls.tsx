import React from 'react';
import { Maximize2, Minimize2, Palette } from 'lucide-react';
import { SHAPE_CONFIGS } from '../constants';
import { ShapeType } from '../types';

interface UIControlsProps {
  currentShape: ShapeType;
  onShapeChange: (shape: ShapeType) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  handFactor: number;
}

const UIControls: React.FC<UIControlsProps> = ({
  currentShape,
  onShapeChange,
  currentColor,
  onColorChange,
  isFullScreen,
  onToggleFullScreen,
  handFactor
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 safar-fix-mobile">
      
      {/* Header / Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tighter drop-shadow-md">
            Cc<span className="text-blue-400">Design</span>
          </h1>
          <p className="text-white/60 text-xs mt-1 max-w-[200px]">
            Show your hand to the camera. <br/>
            <span className="text-blue-300">Open Hand</span> = Expand <br/>
            <span className="text-red-300">Fist</span> = Contract
          </p>
        </div>
        
        <div className="flex gap-2">
            {/* Color Picker Trigger (Native input styled) */}
            <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                     <Palette className="w-5 h-5 text-white" />
                </div>
                <input 
                    type="color" 
                    value={currentColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>

            <button
            onClick={onToggleFullScreen}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white"
            >
            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
        </div>
      </div>

      {/* Hand Feedback Indicator (Visual Debug) */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 hidden sm:flex flex-col gap-2 items-center pointer-events-none opacity-50">
         <div className="h-32 w-2 bg-white/10 rounded-full overflow-hidden backdrop-blur">
            <div 
                className="w-full bg-gradient-to-t from-blue-500 to-purple-500 transition-all duration-100 ease-linear"
                style={{ height: `${handFactor * 100}%`, marginTop: `${(1-handFactor)*100}%` }}
            />
         </div>
         <span className="text-[10px] text-white/50 rotate-90 mt-2">INTENSITY</span>
      </div>

      {/* Bottom Shape Selector */}
      <div className="pointer-events-auto overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible no-scrollbar">
        <div className="flex sm:flex-wrap sm:justify-center gap-3 min-w-max sm:min-w-0">
          {SHAPE_CONFIGS.map((config) => {
            const isActive = currentShape === config.id;
            return (
              <button
                key={config.id}
                onClick={() => {
                    onShapeChange(config.id);
                    onColorChange(config.color);
                }}
                className={`
                  relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 border
                  ${isActive 
                    ? 'bg-white/20 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' 
                    : 'bg-black/40 border-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'}
                `}
              >
                <span className="text-xl">{config.icon}</span>
                <span className={`text-sm font-medium ${isActive ? 'block' : 'hidden sm:block'}`}>
                  {config.label}
                </span>
                {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UIControls;
