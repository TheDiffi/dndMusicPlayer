enum IpcChannelsSend {
  getProfile = "getProfile",
  getSongs = "getSongs",
  getSong = "getSong",
  deleteSong = "deleteSong",
  addSong = "addSong",



  songRequest = "songRequest",
  ambienceRequest = "ambienceRequest",
  ambienceClose = "ambienceClose",
  addSongPopup = "addSongPopup",
  ambienceDuplicateCheck = "ambienceDuplicateCheck",
  

  testSend = "testSend",
}

enum IpcChannelsReturn {
  returnProfile = "returnProfile",
  returnSongs = "returnSongs",
  ambienceClosed = "ambienceClosed",
  addSongButton = "addSongButton",
  testReply = "testReply",
  playAmbience = "playAmbience",
}
