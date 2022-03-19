const youtubedl = require("youtube-dl");

const video_url = "https://youtu.be/EgPvVhNCFHQ";
youtubedl.getInfo(video_url, function (err, info) {
  if (err) throw err;
  console.log(info);
  //length: 5; 256x144, 426x240, 640x360, 854x480, 1280x720
  //   const manifest_url = info.formats[0]["manifest_url"];
});
