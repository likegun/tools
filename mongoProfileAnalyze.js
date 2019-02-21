#!/usr/bin/env node
'use strict';
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const $ = require('./functional');
const victim = process.argv[2];

const profiles = require(path.join(__dirname, victim));

const uniqueProfiles = profiles.reduce((result, profile) => {
    if(!result.find(e => e.ns === profile.ns && e.op === profile.op && _.isEqual($.removeValue()(e.query), $.removeValue()(profile.query)))) result.push(profile);
    return result;
}, []);
console.log(profiles.length);
console.log(uniqueProfiles.length);
fs.writeFileSync(path.join(__dirname, `${victim}-result`), JSON.stringify(uniqueProfiles, null, 2));