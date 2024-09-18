// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: images;

const subreddit = args.widgetParameter || "EarthPorn";

function isImage(url) {
  return /\.(jpg|jpeg|png|gif)$/.test(url);
}

function getHighQualityImage(url) {
  if (url.includes('preview.redd.it')) {
    return url.replace(/(preview|thumbnail)/, 'i').replace(/&amp;/g, '&');
  }
  return url;
}

async function getRandomImage(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/random.json`;
  
  let imageUrl = null;
  let postUrl = null;
  
  while (!imageUrl) {
    const req = new Request(url);
    const res = await req.loadJSON();
    
    const post = res[0].data.children[0].data;
    const potentialImageUrl = post.url;
    
    if (isImage(potentialImageUrl)) {
      imageUrl = getHighQualityImage(potentialImageUrl);
      postUrl = `https://www.reddit.com${post.permalink}`;
    }
  }
  
  return { imageUrl, postUrl };
}

async function createWidget() {
  const { imageUrl, postUrl } = await getRandomImage(subreddit);
  const imgReq = new Request(imageUrl);
  const img = await imgReq.loadImage();

  const widget = new ListWidget();
  widget.backgroundImage = img;
  widget.url = postUrl;

  widget.addSpacer();
  
  const title = widget.addText(`r/${subreddit}`);
  title.textColor = Color.white();
  title.textOpacity = 0.8;
  title.font = Font.boldSystemFont(12);

  return widget;
}

let widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}

Script.complete();

const updateInterval = 15 * 60;
const updateDate = new Date(Date.now() + updateInterval * 1000);
widget.refreshAfterDate = updateDate;