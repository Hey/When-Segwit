// Import packages.
const axios = require('axios')
const delay = require('delay')
const circularJSON = require('circular-json');
const fs = require('file-system');
const encode = require('nodejs-base64-encode');
const fetch = require('node-fetch')

// Twitter accounts to watch:
var accounts = ["Blockchain"]

// Allow reading from .env
require('dotenv').config();

// Start.
async function go() {

    // Loop accounts.
    await asyncForEach(accounts, user => checkAccount(user));

    // Over
    await delay(2500)
    go()

}

// Function to check account,
async function checkAccount(item) {
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
        console.log(`Identical Tweet: '${result}'`)
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
    var item = process.env.TWITTER_KEY
    var token = `Bearer ${item}`
    var url = `https://api.twitter.com/1.1/statuses/user_timeline.json?count=1&include_my_retweet=0&include_rts=0&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&screen_name=${username}`
  
    var result = (await axios.get(url, { headers: { Authorization: token } })).data
    var data = circularJSON.stringify(result);
    /*var data = data.toString()
    var newData = data.replace(/\\n/g, '%newLine%')*/
    var data = JSON.parse(data)

    return data[0]
}

// Reply to.
async function replyTo(id) {

    const exec = require('child_process').exec;
    const sendTweet = exec(`sh sendTweet.sh ${id} ${process.env.TWITTER_KEY}`);
    sendTweet.stdout.on('data', (data)=>{
        //console.log(`Tweet sent success: ${data}`); 
    });
    sendTweet.stderr.on('data', (data)=>{
        //console.error(`Tweet sending fail: ${data}`);
    });
    console.log('Sent Tweet')

    // Sends request.
    /*var headers = { 'authorization': `Bearer ${process.env.TWITTER_KEY}` }
    var data = {}
    var result = (await axios.post('https://api.twitter.com/1.1/statuses/update.json', { headers: headers, data: data })).data*/
}

// Function to async read through array.
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

// Start program.
go()