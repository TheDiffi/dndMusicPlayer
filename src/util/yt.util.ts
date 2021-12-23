import { Song } from "src/renderer";
import YouTubeApiEmbed from "youtube-player";

function createNewYTPlayer(parentId: string, ytId: string, typeEmbed: "music" | "ambience", parentClassName: string = 'ytPlayer'): YTPlayer {
  var amountExistingPlayers = document.getElementById(parentId).getElementsByClassName(parentClassName).length;
  var playerId = amountExistingPlayers ? amountExistingPlayers + 1 : 1;

  //creates the player Container
  var playerContainer = document.createElement('div');
  playerContainer.className = parentClassName + ' rpgui-container framed-grey';
  playerContainer.id = parentClassName + playerId;
  document.getElementById(parentId).appendChild(playerContainer);

  if(typeEmbed === "music"){
    document.getElementById(parentId).appendChild(document.createElement('hr'));
  }

  let apiEmbed = createYTAPIEmbed(playerContainer, ytId, playerId);
  let controlsEmbed = generateEmbedControls(playerContainer, playerId, apiEmbed, typeEmbed);

  let newPlayer: YTPlayer = {
    api: apiEmbed,
    type: typeEmbed,
    controls: controlsEmbed,
    id: playerId,
    song: null
  }

  return newPlayer;
}

function createYTAPIEmbed(playerContainer: HTMLDivElement, ytId: string, playerId: number,
  apiEmbedOptions: { autoplay: number, loop: number } = { autoplay: 0, loop: 0 }) {

  //creates the embed container
  let apiEmbedContainer = document.createElement('div');
  let embedId = 'ytEmbed' + playerId
  apiEmbedContainer.id = embedId;
  apiEmbedContainer.className = 'yt-embed rpgui-container framed-grey'
  playerContainer.appendChild(apiEmbedContainer);

  //creates the apiEmbed via YtAPI 
  let apiEmbed = YouTubeApiEmbed(embedId, {
    height: "70",
    width: "auto",
    videoId: ytId,
    playerVars: apiEmbedOptions,
  });

  return apiEmbed;
}

function generateEmbedControls(playerContainer: HTMLDivElement, ownId: number, ytapi: any, type: "music" | "ambience"): HTMLDivElement {

  //volume slider
  let slider = document.createElement("input");
  let attr = [
    "class",
    "volume-slider",
    "type",
    "range",
    "min",
    "0",
    "max",
    "100",
    "value",
    "50",
  ];

  for (let i = 0; i < attr.length; i += 2) {
    slider.setAttribute(attr[i], attr[i + 1]);
  }
  slider.addEventListener("change", () => {
    ytapi.setVolume(slider.value);
  });

  let span = document.createElement("span");
  span.innerText = "Lautstärke";

  const vol = document.createElement('div');
  vol.appendChild(slider);
  vol.appendChild(slider);

  //Buttons
  let pauseBtn = document.createElement("button");
  pauseBtn.innerText = ">||";
  pauseBtn.className = "pause EmbedBtn";
  pauseBtn.addEventListener("click", () => pauseBtnEvent(ytapi));

  let randBtn = document.createElement('button');
  randBtn.innerText = 'rand';
  randBtn.className = "rand EmbedBtn";
  randBtn.addEventListener("click", () => playRandomTime(ytapi));

  const btns = document.createElement('div');
  btns.appendChild(pauseBtn);
  btns.appendChild(randBtn);

  if (type === "ambience") {
    let closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.className = "close EmbedBtn";
    closeBtn.addEventListener("click", () => closePlayer(playerContainer));
    btns.appendChild(closeBtn);
  }
 

  //container
  let container = document.createElement("div");
  container.className = "embed-controls";
  container.id = 'yt-api-controls' + ownId;
  container.appendChild(btns);
  container.appendChild(vol);

  //appeds the container
  playerContainer.appendChild(container);

  //RPGUI stuff here

  //return
  return container;
}


async function pauseBtnEvent(ytapi: any) {
  if (await ytapi.getPlayerState() == 1) {
    ytapi.pauseVideo();
  } else {
    ytapi.playVideo();
  }
}

function closePlayer(playerContainer: HTMLDivElement): any {
  playerContainer.remove();
}

async function playRandomTime(ytapi: any) {
  let duration = await ytapi.getDuration()
  ytapi.seekTo(Math.random() * (duration - (duration / 10)), true)
}


function playExampleVid(ytapi: any): void {
  ytapi.loadVideoById("rQryOSyfXmI");
}



interface YTPlayer {
  song: Song
  api: any;
  type: 'music' | 'ambience';
  controls: HTMLDivElement;
  id: number;
  //TODO: add rest

}

export { createNewYTPlayer, YTPlayer }

//-------------------------------------------------------------------
function playYtUrl(url: string, appendToId: string = "ytContainer") {
  if (null === document.getElementById("ytEmbed")) {
    createYTEmbed(appendToId, url);
  } else {
    document.getElementById("ytEmbed")!.setAttribute("src", url);
  }
}

function extractYtIdFromLink(ytUrl: string) {
  var regExp =
    RegExp(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
  var match = ytUrl.match(regExp);
  return match && match[7].length == 11 ? match[7] : "";
}

function parseYtIdToEmbedLink(
  ytId: string,
  isAutoplay = false,
  isLoop = false,
  videoLength = 0

) {
  let autoplayParam = isAutoplay ? "autoplay=1" : "autoplay=0";
  let randomStartParam =
    videoLength != 0
      ? "start=" + Math.floor(Math.random() * (videoLength * 60 * 0.75))
      : "start=0";
  let loopParam = isLoop ? "loop=1&playlist=" + ytId : "loop=0";

  let url =
    "http://www.youtube.com/embed/" +
    ytId +
    "?" +
    autoplayParam +
    "&" +
    randomStartParam +
    "&" +
    loopParam;
  console.log("parseYtIdToEmbedUrl: " + url);
  return url;
}

function createYTEmbed(
  appendToId: string,
  ytUrl: string,
  asAudioPlayer = false
) {
  const iframe = document.createElement("iframe");
  const width = asAudioPlayer ? 560 : 560;
  const height = asAudioPlayer ? 25 : 315;
  let attr2 = [
    "ytEmbed",
    "560",
    "315",
    ytUrl,
    "Player",
    "0",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
  ];
  ["id", "width", "height", "src", "title", "frameborder", "allow"].forEach(
    (attr1) => {
      if (attr2.length > 0) {
        console.log(attr1 + " : " + attr2[0]);
        iframe.setAttribute(attr1, attr2.shift()!);
      }
    }
  );
  const ytContainer = document.getElementById(appendToId);
  ytContainer?.appendChild(iframe);
}

export { extractYtIdFromLink, parseYtIdToEmbedLink, createYTEmbed, playYtUrl };

