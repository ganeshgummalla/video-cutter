import React, { useState, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { ProcessingOptions } from './components/ProcessingOptions';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

function App() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState({
    quality: '1080p',
    segmentDuration: 50,
    aspectRatio: '9:16'
  });

  const handleOptionChange = (option: string, value: any) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error('File size exceeds 500MB limit');
      return;
    }

    setProcessing(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('options', JSON.stringify(options));

    try {
      const response = await axios.post('http://localhost:3000/process-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        toast.success(`Successfully processed ${response.data.segments} clips!`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error processing video';
      toast.error(errorMessage);
      console.error('Error:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, [options]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Video Processor</h1>
          <p className="text-lg text-gray-600">
            Transform your videos with custom segments and aspect ratios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <UploadZone
              onDrop={onDrop}
              processing={processing}
              progress={progress}
            />
          </div>
          <div className="md:col-span-1">
            <ProcessingOptions
              options={options}
              onOptionChange={handleOptionChange}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Features:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Customizable segment duration</li>
              <li>Multiple aspect ratio options</li>
              <li>HD quality processing</li>
              <li>Smart content scaling</li>
            </ul>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Automatic screen fitting</li>
              <li>Progress tracking</li>
              <li>Error handling</li>
              <li>File size validation</li>
            </ul>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;