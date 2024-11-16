import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

// Configure multer for video upload with size limit
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      cb(new Error('Only video files are allowed'));
      return;
    }
    cb(null, true);
  }
});

// Ensure upload and output directories exist
const setupDirectories = async () => {
  const dirs = ['uploads', 'output'];
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir);
    }
  }
};

setupDirectories();

const getVideoResolution = (quality) => {
  const resolutions = {
    '1080p': { width: 1080, height: 1920 },
    '720p': { width: 720, height: 1280 },
    '480p': { width: 480, height: 854 }
  };
  return resolutions[quality] || resolutions['1080p'];
};

const getAspectRatioDimensions = (aspectRatio, quality) => {
  const baseRes = getVideoResolution(quality);
  switch (aspectRatio) {
    case '16:9':
      return { width: baseRes.height, height: baseRes.width };
    case '1:1':
      return { width: baseRes.width, height: baseRes.width };
    default: // 9:16
      return baseRes;
  }
};

app.post('/process-video', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No video file uploaded' });
  }

  try {
    const options = JSON.parse(req.body.options || '{}');
    const { quality = '1080p', segmentDuration = 50, aspectRatio = '9:16' } = options;
    
    const inputPath = req.file.path;
    const outputDir = 'output';
    
    // Get video duration
    const duration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) reject(err);
        resolve(metadata.format.duration);
      });
    });

    const segments = Math.ceil(duration / segmentDuration);
    const dimensions = getAspectRatioDimensions(aspectRatio, quality);
    const processPromises = [];

    for (let i = 0; i < segments; i++) {
      const outputPath = join(outputDir, `clip_${i + 1}.mp4`);
      const startTime = i * segmentDuration;

      const promise = new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(startTime)
          .setDuration(segmentDuration)
          .size(`${dimensions.width}x${dimensions.height}`)
          .videoFilters([
            `scale=${dimensions.width}:${dimensions.height}:force_original_aspect_ratio=decrease`,
            `pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2`
          ])
          .videoBitrate('4000k')
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      processPromises.push(promise);
    }

    await Promise.all(processPromises);
    await fs.unlink(inputPath);

    res.json({ 
      success: true, 
      message: 'Video processing completed',
      segments: segments
    });

  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error processing video'
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});