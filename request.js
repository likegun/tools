'use strict';
const fs = require('fs');
let request = require('request');

const get = (url, qs = {}, headers = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        options = Object.assign({ qs, headers }, options);
        request(url, options, (err, res, body) => {
            if(err) reject(err);
            else resolve({res, body});
        });
    });
};

const getFollowAllRedirects = (url, qs = {}, headers = {}, options = {}, maxRedirect = 20) => {
    return new Promise(async (resolve, reject) => {
        try {
            let redirect = true;
            
            let body, res;
            while(redirect) {
                if(!maxRedirect) throw new Error(`超过最大重定向次数:${maxRedirect}`);
                
                const ret = await get(url, qs, headers, options);
                body = ret.body, res = ret.res;
                if(res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    url = res.headers.location;
                    qs = {};
                }
                redirect = false;
                maxRedirect --;
            }
            resolve({ body, res });
        } catch(e) { reject(e); }
    });
};

const post = (url, qs = {}, form = {}, headers = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        options = Object.assign({ qs, headers, form }, options);
        request.post(url, options, (err, res, body) => {
            if(err) reject(err);
            else resolve({res, body});
        });
    });
};

const download = (url, target, qs = {}, headers = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        options = Object.assign({ qs, headers, method: 'GET' }, options);
        request(url, options)
            .pipe(fs.createWriteStream(target))
            .on('error', reject)
            .on('finish', resolve);
    });
};

const upload = (url, files = {}, fields = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        const formData = fields;

        Object.keys(files).forEach(key => {
            formData[key] = fs.createReadStream(files[key]);
        });

        options = Object.assign({ formData }, options);
        request.post(url, options, (err, res, body) => {
            if(err) reject(err);
            else resolve({ res, body });
        });
    });
};

const setDefaults = (defaults = {}) => {
    request = request.defaults(defaults);
};

module.exports = {
    get,
    post,
    download,
    upload,
    setDefaults,
    getFollowAllRedirects
};
