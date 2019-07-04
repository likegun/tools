'use strict';
const _ =require('lodash');
const iconv = require('iconv-lite');
const request = require('request');
const nodejieba = require('nodejieba');
const map = {};

function postRaw(url , qs, form, headers, options) {
  return new Promise((resolve, reject) => {
    options = Object.assign({ qs, headers }, options);
    const req = request.post(url, options, (err, res, body) => {
        if(err) reject(err);
        else resolve({res, body});
    });
    console.log(Object.keys(form).map(key => `${key}=${form[key]}`).join('&'));
    req.write(Buffer.from(Object.keys(form).map(key => `${key}=${form[key]}`).join('&')));
    req.end();
  }); 
}

function utf8ToGb2312(string) {
  const result = [];
  iconv.encode(Buffer.from(string), 'gb2312').forEach(buffer => result.push('%' + buffer.toString(16)));
  return result.join('');
}

async function getSameMeaningWord(word) {
  if(map[word]) return map[word];
  console.log(utf8ToGb2312('幸运'));
  let { body } = await postRaw('http://jyc.5156edu.com/index.php', {}, {
    f_key: utf8ToGb2312(word),
    'SearchString.x': 0,
    'SearchString.y': 0,
  }, {
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Encoding':'gzip, deflate',
    'Accept-Language':'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control':'max-age=0',
    'Connection':'keep-alive',
    'Content-Type':'application/x-www-form-urlencoded',
    'Host':'jyc.5156edu.com',
    'Origin':'http://jyc.5156edu.com',
    'Referer':'http://jyc.5156edu.com/',
    'Upgrade-Insecure-Requests':'1',
    'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
  }, {
    gzip: true,
    encoding: null,
    followAllRedirects: true
  });
  body = iconv.decode(body, 'gb2312');
  let match = body.match(/>[\u4e00-\u9fa5]+?\( /g);
  if(!match) return map[word] = word;
  match = match.filter(e => !e.includes('>注释:<')).map(e => e.slice(1, -2));
  return map[word] = _.sample(match);
}

async function replace(context) {
  const words = nodejieba.cut(context);
  const resultWords = [];
  for(const word of words) {
    resultWords.push(await getSameMeaningWord(word));
  }
  return resultWords.join();
}

(async () => {
  try{
    console.log(await replace('不知道大家有没有发现一件事情'));
  }
  catch(e) {
    console.log(e);
  }
})();

module.exports = replace;