onst multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload.single('video', async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No video file received.');
        }

        const videoBuffer = req.file.buffer;

        // Use fluent-ffmpeg to encode the video
        const encodedVideoBuffer = await new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoBuffer)
                .inputFormat('webm')
                .videoCodec('libx264')
                .audioCodec('aac')
                .toFormat('mp4')
                .on('end', () => {
                    console.log('Video encoding complete.');
                })
                .on('error', (err) => {
                    console.error('Error during video encoding:', err);
                    reject(err);
                })
                .on('data', (chunk) => {
                    // Collect encoded video data in memory
                    resolve(chunk);
                });
        });

        res.status(200).send(encodedVideoBuffer);
    } catch (error) {
        console.error('Error during video encoding:', error);
        res.status(500).send('Video encoding failed.');
    }
});
