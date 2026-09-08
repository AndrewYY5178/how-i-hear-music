import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
const files = ['app.js','sw.js','server.mjs'];
async function walk(dir) { for (const entry of await readdir(dir,{withFileTypes:true})) { const path=join(dir,entry.name); if(entry.isDirectory())await walk(path);else if(/\.(m?js)$/.test(path))files.push(path); } }
for(const dir of ['modules','worker','server'])await walk(dir);
for(const path of files){const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status!==0){console.error(result.stderr);process.exit(1);}}
console.log(`Syntax checks passed: ${files.length} application modules.`);
