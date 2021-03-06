// Import modules.
const axios = require('axios')
const delay = require('delay')
const circularJSON = require('circular-json');
const fs = require('file-system');
const encode = require('nodejs-base64-encode');
const fetch = require('node-fetch')
const open = require('open');

// This allows editing the list of usernames to watch.
async function editAccounts() {
    log('Opening accounts file.')
    open('accounts.txt');
}

// This allows editing the Twitter authorization.
async function editAuthorization() {
    log('Opening config file.')
    open('.env');
}

// Allow reading from .env
require('dotenv').config();

// File content.
var accountsContent;
var envContent;

// Start.
async function go() {

  // Checks if environment variables are even set.
  if (process.env.AUTH_TOKEN == "0") return log('Welcome new user, set your keys to start!')

  // Check configuration change,
  await configCheck()

  // Twitter accounts to watch.
  // Read accounts.txt & if empty, use @Blockchain as example.
  let accounts = fs.readFileSync('./accounts.txt').toString().split(/\r\n|\n|\r/)
  if (accounts < 1) accounts = ["Blockchain"]

  // Loop accounts.
  await asyncForEach(accounts, user => checkAccount(user));

  // Over
  await delay(2500)
  go()

}

// Checks if any file data has changed.
async function configCheck() {

  // Checks if file exists, if not, creates it.
  try { var accountsFile = await fs.readFileSync('./accounts.txt') } catch(e) { var accountsFile = false; }
  try { var envFile = await fs.readFileSync('./.env') } catch(e) { var envFile = false; }
  if (!accountsFile) await fs.writeFile('./accounts.txt', 'Blockchain')
  if (!envFile) await fs.writeFile('./.env', 'CSRF=0\nAUTH_TOKEN=0\nSESSION=0\nPORT=1204')


  // If first try.
  if (!accountsContent) accountsContent = await fs.readFileSync('./accounts.txt').toString()
  if (!envContent) envContent = await fs.readFileSync('./.env').toString()

  // Compares results.
  if ((fs.readFileSync('./accounts.txt').toString() != accountsContent) || (fs.readFileSync('.env').toString() != envContent)) {
    log('Configuration change, reloading.')
    location.reload();
  }
}

// Checks as fast as possible on config changes.
setTimeout(configCheck, 250);

// Function to check account,
async function checkAccount(item) {

    // Validate length.
    if (item.length < 1) return

    // Get results & validate & use.
    var rawResult = await getTweets(item)
    if (!rawResult) return log(`No response for @${item}`)
    var result = rawResult.id_str

    // Disallows replying from own account.
    /*if (rawResult.user.screen_name == item) {
        return log(`Ignoring reply to self: @${item}`)
    // Prevents replying to mentions/tags.
    } else if (result.full_text.startsWith("@")) {
        return log(`Ignoring mention Tweet: @${item}`)
    } else */ if (result == "error") {
      //await delay(theCooldown)
      //checkAccount(item);
      return log(`Error, failed to get Tweets for @${item}.`)
    } else if (result == "not_exist") {
      //await delay(theCooldown)
      //checkAccount(item);
      return log(`@${item} does not exists.`)
    } else if (result == "no_tweets") {
      //await delay(theCooldown)
      //checkAccount(item);
      return log(`@${item} has no tweets.`)
    } else if (result == "suspended") {
      //await delay(theCooldown)
      //checkAccount(item);
      return log(`@${item} is suspended.`)
    } else if (!result) return log(`No result for @${item}`)

    if (fs.existsSync(`database/${item}.txt`)) {

      var fileContent = await fs.readFileSync(`database/${item}.txt`).toString()

      if (fileContent != result) {
        //log(rawResult.full_text)
        // Disallows replying from own account.
        /*if (rawResult.user.screen_name == item) {
            return log(`Ignoring reply to self: @${item}`)*/
        // Prevents replying to mentions/tags.
        /*} else */if (rawResult.full_text.startsWith("@")) {
            return log(`Ignoring mention Tweet: @${item}`)
        } 

        log('New Tweet, saving it.')
        await fs.writeFileSync(`database/${item}.txt`, result);

        log(`@${item}'s latest Tweet: '${result}'`);

        await replyTo(result)
      } else {
        //log(`Identical Tweet: '${result}' (@${item})`)
      }

      await delay(1000)
      //checkAccount(item)
    } else {
      await fs.writeFileSync(`database/${item}.txt`, '');
      log(`Created database file for ${item}`)

      //checkAccount(item)
    }
}

// Function to get the Tweets of an user.
async function getTweets(username) {
    try {

        // Make the request.
        var url = `https://api.twitter.com/1.1/statuses/user_timeline.json?count=1&include_my_retweet=0&include_rts=0&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&screen_name=${username}`
        var result = (await axios.get(url, { headers: { Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA` } })).data
        
        // Parse request.
        var data = circularJSON.stringify(result);
        var data = JSON.parse(data)
    
        // Return the result.
        return data[0]   
    
    } catch (error) {
        log(`Error occurred when checking Tweets for @${username}, retrying, error: ${error}`)
        await delay(1000)
        return []
        //return await getTweets(username)
    }
}

// Reply to.
async function replyTo(id) {
  
  // Let know that request is sent.
  log(`Requested reply for Tweet: ${id}`)

  // Sends request to our API.
  var result = await axios({
    method: 'get',
    url: `http://localhost:${process.env.PORT}/sendTwitter/${id}`
  })

  // Debugging.
  //log(result.data)


  /*const exec = require('child_process').exec;
  const sendTweet = exec(`sh sendTweet.sh ${id} ${process.env.TWITTER_KEY} ${process.env.CSRF} ${process.env.AUTH_TOKEN} ${process.env.SESSION}`);
  sendTweet.stdout.on('data', (data)=>{
    log(`Tweet sent success: ${data}`); 
  });
  sendTweet.stderr.on('data', (data)=>{
    error(`Tweet sending fail: ${data}`);
  });
  log('Sent Tweet')*/
}

// Function to async read through array.
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}














// Upon page load.
document.addEventListener("DOMContentLoaded", function() {
    
    // Vanity.
    log('Welcome to When Segwit!')

    // Button listeners.
    document.getElementById("editAccountsButton").addEventListener("click", editAccounts);
    document.getElementById("editAuthorizationButton").addEventListener("click", editAuthorization);

    // Start program.
    go()
});

function log(msg) {
  console.log(msg)
  addLog(msg)
}

function addLog(msg) {
  $('#messages').append($('<li>').text(`[${getTime()}] ${msg}`));
  window.scrollTo(0, document.body.scrollHeight);
}

function getTime() {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var d = new Date();

  var day = days[d.getDay()];
  var hr = d.getHours();
  var min = d.getMinutes();

  if (min < 10) min = "0" + min;

  var ampm = "am";
  if( hr > 12 ) {
      hr -= 12;
      ampm = "pm";
  }

  var date = d.getDate();
  var month = months[d.getMonth()];
  var year = d.getFullYear();

  return hr + ":" + min + ampm + " " + date + " " + month
}