const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = async (req, res, next) => {
    upload.single('video')(req, res, async (err) => {
        try {
            if (err) {
                console.error('Error during video upload:', err);
                res.status(500).send('Video upload failed.');
                return;
            }

            if (!req.file) {
                return res.status(400).send('No video file received.');
            }

            const videoBuffer = req.file.buffer;

            // Use fluent-ffmpeg to encode the video
            const encodedVideoBuffer = await new Promise((resolve, reject) => {
                const encodedVideoChunks = [];

                ffmpeg()
                    .input(videoBuffer)
                    .inputFormat('webm')
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .toFormat('mp4')
                    .on('end', () => {
                        console.log('Video encoding complete.');
                        resolve(Buffer.concat(encodedVideoChunks));
                    })
                    .on('error', (err) => {
                        console.error('Error during video encoding:', err);
                        reject(err);
                    })
                    .on('data', (chunk) => {
                        // Collect encoded video data in memory
                        encodedVideoChunks.push(chunk);
                    });
            });

            res.status(200).send(encodedVideoBuffer);
        } catch (error) {
            console.error('Error during video encoding:', error);
            res.status(500).send('Video encoding failed.');
        }
    });
}
