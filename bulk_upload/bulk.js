const fs = require("fs");
const axios = require("axios");
const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false, // Ignore SSL certificate issues
});

async function uploadLargeFile(filePath) {
  const fileStream = fs.createReadStream(filePath, {
    encoding: "utf8",
    highWaterMark: 512 * 1024, // Reduced buffer size
  });
  // Add backpressure handling
  fileStream.pause();

  const response = await axios.post(process.env.URL, fileStream, {
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    httpsAgent: agent, // Use custom agent to bypass SSL validation
    onUploadProgress: (progressEvent) => {
      if (progressEvent.loaded > progressEvent.total * 0.95) {
        fileStream.pause();
        setTimeout(() => fileStream.resume(), 100);
      }
    },
  });

  return response.data;
}

module.exports = uploadLargeFile;
