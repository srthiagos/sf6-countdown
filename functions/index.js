/* eslint-disable camelcase */
const functions = require("firebase-functions");
const uuid = require("uuid");
const crypto = require("crypto");
const { default: axios } = require("axios");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

const methods = {
  get: "GET",
  post: "POST",
  path: "PATH",
  delet: "DELETE",
};

const createAuth = (envs, method, url, query = {}) => {
  const oauth_timestamp = Math.round(new Date().getTime() / 1000);
  const oauth_nonce = encodeURIComponent(uuid.v1());
  const oauth_consumer_key = envs.CONSUMER_KEY;
  const oauth_consumer_secret = envs.CONSUMER_SECRET;
  const oauth_token = envs.OAUTH_TOKEN;
  const oauth_secret = envs.OAUTH_SECRET;
  const oauth_signature_method = "HMAC-SHA1";
  const oauth_version = "1.0";
  const oauth_signing_key = `${oauth_consumer_secret}&${oauth_secret}`;

  const headers = {
    oauth_consumer_key,
    oauth_consumer_secret,
    oauth_token,
    oauth_secret,
    oauth_signing_key,
    oauth_signature_method,
    oauth_timestamp,
    oauth_nonce,
    oauth_version,
  };

  const newQueryString = Object.assign(headers, query);
  const queryString = Object.keys(newQueryString)
    .sort()
    .map((k) => {
      return `${k}=${newQueryString[k]}`;
    })
    .join("&");

  const oauth_base_string = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(queryString)}`;

  const oauth_signature = crypto
    .createHmac("sha1", oauth_signing_key)
    .update(oauth_base_string)
    .digest()
    .toString("base64");

  headers.oauth_signature = encodeURIComponent(oauth_signature);

  const oauth_authorization_header = Object.keys(headers)
    .map((k) => {
      return `${k}=${headers[k]}`;
    })
    .join(", ");

  return oauth_authorization_header;
};

const buildCountDownTweet = () => {
  // const releaseDate = dayjs("10/12/2022", "DD/MM/YYYY");
  const curDate = dayjs();
  const releaseDate = dayjs("02/06/2023", "DD/MM/YYYY");

  // const data = JSON.stringify({ "text": `${countdown} days left`, "media": {
  // "media_ids": ["1501312416398733314"] } });
  const data = {
    text: `${releaseDate.diff(
      curDate, "d"
    ) + 1} days!`,
  };

  if (releaseDate.diff(curDate, "hour") < 1) {
    data.text = "It's happening!!!!!!! RELEASE SOON!!! #StreetFighter";
    // data.media = { media_ids: ["1569720599198502913"] };
  }
  data.text += " #SF6 #StreetFighter6 #StreetFighter #Countdown";
  return data;
};

exports.countDown = functions
  .runWith({
    secrets: [
      "UID",
      "OAUTH_TOKEN",
      "OAUTH_SECRET",
      "CONSUMER_SECRET",
      "CONSUMER_KEY",
    ],
  })
  .https.onRequest((req, res) => {
    const url = "https://api.twitter.com/2/tweets";
    const authorization = createAuth(process.env, methods.post, url);
    const data = buildCountDownTweet();

    const config = {
      method: methods.post,
      url,
      headers: {
        "Authorization": `OAuth ${authorization}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };

    return axios(config)
      .then(() => {
        console.info("Twitter API request did well");
        res.json(data);
      })
      .catch((e) => {
        res.send(e);
      });
  });

exports.countDown = functions
  .runWith({
    secrets: [
      "UID",
      "OAUTH_TOKEN",
      "OAUTH_SECRET",
      "CONSUMER_SECRET",
      "CONSUMER_KEY",
    ],
  })
  .pubsub.schedule("30 23 * * *")
  .timeZone("America/New_York")
  .onRun((context) => {
    const url = "https://api.twitter.com/2/tweets";
    const authorization = createAuth(process.env, methods.post, url);
    const data = buildCountDownTweet();

    const config = {
      method: methods.post,
      url,
      headers: {
        "Authorization": `OAuth ${authorization}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };

    return axios(config)
      .then(() => {
        console.info("Twitter API request did well");
      })
      .catch((e) => {
        console.error(e);
      });
  });
