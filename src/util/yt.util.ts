
export{playYtUrl, extractYtIdFromLink, parseYtIdToEmbedUrl,createYTEmbed}



// _______________YOUTUBE_____________________

function playYtUrl(url: string, appendToId: string = "ytContainer") {
  if (null === document.getElementById("ytEmbed")) {
    createYTEmbed(appendToId, url);
  } else {
    document.getElementById("ytEmbed")!.setAttribute("src", url);
  }
}

function extractYtIdFromLink(ytUrl: string) {
  var regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = ytUrl.match(regExp);
  return match && match[7].length == 11 ? match[7] : "";
}

function parseYtIdToEmbedUrl(
  ytId: string,
  videoLength = 0,
  isAutoplay = false,
  isLoop = false
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


