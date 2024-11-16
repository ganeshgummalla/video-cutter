import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onDrop: (files: File[]) => void;
  processing: boolean;
  progress: number;
}

export function UploadZone({ onDrop, processing, progress }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    multiple: false,
    disabled: processing,
    maxSize: 1024 * 1024 * 500 // 500MB limit
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative overflow-hidden border-2 border-dashed rounded-xl p-12 text-center
        transition-all duration-200 ease-in-out group
        ${isDragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}
        ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        {processing ? (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-purple-500 animate-spin" />
            <div className="space-y-2">
              <div className="text-lg text-gray-600">Processing video... {progress}%</div>
              <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {isDragActive ? (
              <>
                <Video className="w-16 h-16 mx-auto text-purple-500" />
                <p className="text-xl text-purple-600 font-medium">Drop your video here</p>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 mx-auto text-gray-400 group-hover:text-purple-500 transition-colors" />
                <p className="text-xl text-gray-600 font-medium group-hover:text-purple-600 transition-colors">
                  Drag & drop your video here or click to browse
                </p>
              </>
            )}
            <p className="text-sm text-gray-500">
              Supports MP4, MOV, AVI, MKV (max 500MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}