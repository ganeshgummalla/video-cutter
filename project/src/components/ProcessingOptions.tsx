import React from 'react';
import { Settings, Clock, MonitorSmartphone, Video } from 'lucide-react';

interface ProcessingOptionsProps {
  onOptionChange: (option: string, value: any) => void;
  options: {
    quality: string;
    segmentDuration: number;
    aspectRatio: string;
  };
}

export function ProcessingOptions({ onOptionChange, options }: ProcessingOptionsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Processing Options
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            Segment Duration (seconds)
          </label>
          <input
            type="number"
            value={options.segmentDuration}
            onChange={(e) => onOptionChange('segmentDuration', parseInt(e.target.value))}
            min="10"
            max="300"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Video className="w-4 h-4" />
            Quality
          </label>
          <select
            value={options.quality}
            onChange={(e) => onOptionChange('quality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="1080p">1080p HD</option>
            <option value="720p">720p HD</option>
            <option value="480p">480p SD</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MonitorSmartphone className="w-4 h-4" />
            Aspect Ratio
          </label>
          <select
            value={options.aspectRatio}
            onChange={(e) => onOptionChange('aspectRatio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="9:16">9:16 (Portrait)</option>
            <option value="16:9">16:9 (Landscape)</option>
            <option value="1:1">1:1 (Square)</option>
          </select>
        </div>
      </div>
    </div>
  );
}