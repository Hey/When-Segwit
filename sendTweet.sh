curl 'https://api.twitter.com/1.1/statuses/update.json' \
  -H 'authority: api.twitter.com' \
  -H 'dnt: 1' \
  -H "x-csrf-token: $3" \
  -H "authorization: Bearer $2" \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'accept: text/plain, */*; q=0.01' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36' \
  -H 'x-twitter-auth-type: OAuth2Session' \
  -H 'x-twitter-client-version: Twitter-TweetDeck-blackbird-chrome/4.0.200604103812 web/' \
  -H 'origin: https://tweetdeck.twitter.com' \
  -H 'sec-fetch-site: same-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: https://tweetdeck.twitter.com/' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H "cookie: ct0=$3; eu_cn=1; dnt=1; remember_checked_on=1; auth_token=$4; _twitter_sess=$5; lang=en" \
  --data-raw "status=When Segwit?&in_reply_to_status_id=$1&auto_populate_reply_metadata=true&batch_mode=off&exclude_reply_user_ids=&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true" \
  --compressed