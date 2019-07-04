#!/usr/bin/env node
const http = require('http');

function test(level, needGzip = true) {
    return new Promise((resolve, reject) => {
        const START = Date.now();
        const headers = {};
        if(needGzip) headers['Accept-encoding'] = 'gzip';
        const req = http.request({
            hostname: '127.0.0.1',
            port: '9000',
            path: `/test/index?level=${level}`,
            method: 'GET',
            headers
        }, function(res) {
            let size = 0;
            res.on('data', chunk => {
                size += chunk.length;
            });
            res.on('end', () => {
                resolve({
                    cost: Date.now() - START,
                    'x-response-time': res.headers['x-response-time'],
                    contentSize: size
                });
            });
        });
    
        req.on('error', (e) => {
            reject(e);
        });
    
        req.end();
    });
}

(async () => {
  try{
      const TIME = parseInt(process.argv[2]);
    
      console.log(await test(TIME, false));
      console.log(await test(TIME, true));
  }
  catch(e) {
    console.log(e);
  }
})();