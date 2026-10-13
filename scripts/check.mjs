import fs from 'node:fs';import {execFileSync} from 'node:child_process';
for(const folder of ['src','scripts','test','client'])for(const f of fs.readdirSync(folder))if(/\.(m?js)$/.test(f))execFileSync(process.execPath,['--check',folder+'/'+f],{stdio:'inherit'});
JSON.parse(fs.readFileSync('openapi.json'));console.log('Syntax and OpenAPI JSON passed.');
