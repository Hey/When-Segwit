// Import modules.
const {app, BrowserWindow} = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fetch = require('node-fetch')

// Allow reading from .env
require('dotenv').config();

// Disable security warnings.
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Disable CORS protection, partly.
app.commandLine.appendSwitch('disable-features','OutOfBlinkCors');

// Initializes program.
function createWindow () {

  // Create the window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './assets/preload.js'),
      enableRemoteModule: true,
      allowRunningInsecureContent: true,
      webSecurity: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Disable default tool bar.
  mainWindow.setMenuBarVisibility(false)

  // Open the dev tools for testing.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  // Initialize window.
  createWindow()
  
  // Upon full load.
  app.on('activate', function () {
    
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Fixes bug.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})




// API webserver.
const web = express();
web.use(cors());
web.use('/sendTwitter/:id', async (req, res) => {

  // Send the request.
  var result = await fetch("https://api.twitter.com/1.1/statuses/update.json", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "authorization": `Bearer ${process.env.TWITTER_KEY}`,
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-csrf-token": `${process.env.CSRF}`,
      "x-twitter-active-user": "yes",
      "x-twitter-auth-type": "OAuth2Session",
      "x-twitter-client-language": "en",
      "cookie": `ct0=${process.env.CSRF}; eu_cn=1; dnt=1; remember_checked_on=1; auth_token=${process.env.AUTH_TOKEN}; _twitter_sess=${process.env.SESSION}; lang=en`
    },
    "referrer": "https://twitter.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": `include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&simple_quoted_tweet=true&trim_user=false&include_ext_media_color=true&include_ext_media_availability=true&auto_populate_reply_metadata=true&batch_mode=off&in_reply_to_status_id=${req.params.id}&status=When Segwit?`,
    "method": "POST",
    "mode": "cors"
  });

  // Send result back to requester.
  return(res.send(result))


})
web.listen(process.env.PORT, () => { console.log(`API running at port 1204`); });