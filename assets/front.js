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
    console.log('Opening accounts file.')
    open('accounts.txt');
}

// This allows editing the Twitter authorization.
async function editAuthorization() {
    console.log('Opening config file.')
    open('.env');
}

// Allow reading from .env
require('dotenv').config();

// Start.
async function go() {

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

// Function to check account,
async function checkAccount(item) {

    // Validate length.
    if (item.length < 1) return

    // Get results & validate & use.
    var rawResult = await getTweets(item)
    if (!rawResult) return console.log(`No response for @${item}`)
    var result = rawResult.id_str

    // Disallows replying from own account.
    /*if (rawResult.user.screen_name == item) {
        return console.log(`Ignoring reply to self: @${item}`)
    // Prevents replying to mentions/tags.
    } else if (result.full_text.startsWith("@")) {
        return console.log(`Ignoring mention Tweet: @${item}`)
    } else */ if (result == "error") {
      //await delay(theCooldown)
      //checkAccount(item);
      return console.log(`Error, failed to get Tweets for @${item}.`)
    } else if (result == "not_exist") {
      //await delay(theCooldown)
      //checkAccount(item);
      return console.log(`@${item} does not exists.`)
    } else if (result == "no_tweets") {
      //await delay(theCooldown)
      //checkAccount(item);
      return console.log(`@${item} has no tweets.`)
    } else if (result == "suspended") {
      //await delay(theCooldown)
      //checkAccount(item);
      return console.log(`@${item} is suspended.`)
    } else if (!result) return console.log(`No result for @${item}`)

    if (fs.existsSync(`database/${item}.txt`)) {

      var fileContent = await fs.readFileSync(`database/${item}.txt`).toString()

      if (fileContent != result) {
        // Disallows replying from own account.
        /*if (rawResult.user.screen_name == item) {
            return console.log(`Ignoring reply to self: @${item}`)*/
        // Prevents replying to mentions/tags.
        /*} else */if (rawResult.full_text.startsWith("@")) {
            return console.log(`Ignoring mention Tweet: @${item}`)
        } 

        console.log(`${fileContent} versus ${result}`)
        replyTo(result)
        console.log('New Tweet, saving it.')
        await fs.writeFileSync(`database/${item}.txt`, result);

        console.log(`@${item}'s latest Tweet: '${result}'`);
      } else {
        console.log(`Identical Tweet: '${result}' (@${item})`)
      }

      await delay(1000)
      //checkAccount(item)
    } else {
      await fs.writeFileSync(`database/${item}.txt`, '');
      console.log(`Created database file for ${item}`)

      //checkAccount(item)
    }
}

// Function to get the Tweets of an user.
async function getTweets(username) {
    try {

        // Make the request.
        var url = `https://api.twitter.com/1.1/statuses/user_timeline.json?count=1&include_my_retweet=0&include_rts=0&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&screen_name=${username}`
        var result = (await axios.get(url, { headers: { Authorization: `Bearer ${process.env.TWITTER_KEY}` } })).data
        
        // Parse request.
        var data = circularJSON.stringify(result);
        var data = JSON.parse(data)
    
        // Return the result.
        return data[0]   
    
    } catch (error) {
        console.log(`Error occurred when checking Tweets for @${username}, retrying, error: ${error}`)
        await delay(1000)
        return await getTweets(username)
    }
}

// Reply to.
async function replyTo(id) {
  
  // Let know that request is sent.
  console.log(`Requested reply for Tweet: ${id}`)

  // Sends request to our API.
  var result = await axios({
    method: 'get',
    url: `http://localhost:${process.env.PORT}/sendTwitter/${id}`
  })

  // Debugging.
  console.log(result.data)


  /*const exec = require('child_process').exec;
  const sendTweet = exec(`sh sendTweet.sh ${id} ${process.env.TWITTER_KEY} ${process.env.CSRF} ${process.env.AUTH_TOKEN} ${process.env.SESSION}`);
  sendTweet.stdout.on('data', (data)=>{
    console.log(`Tweet sent success: ${data}`); 
  });
  sendTweet.stderr.on('data', (data)=>{
    console.error(`Tweet sending fail: ${data}`);
  });
  console.log('Sent Tweet')*/
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
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nWelcome to "When Segwit"!')

    // Button listeners.
    document.getElementById("editAccountsButton").addEventListener("click", editAccounts);
    document.getElementById("editAuthorizationButton").addEventListener("click", editAuthorization);

    // Start program.
    go()
});