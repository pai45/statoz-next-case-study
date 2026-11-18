import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {metrics,csvText,cohorts,miniGames,coreFrequency} from '../src/metrics.mjs';
test('report transcription retains complete primary tables and explicit reconciliation',()=>{
 assert.equal(cohorts.reduce((sum,row)=>sum+row[1],0),10641);
 assert.equal(miniGames.reduce((sum,row)=>sum+row[1],0),1142);
 assert.equal(metrics.filter(m=>m.category==='Coins'&&m.label==='Coins placed'&&m.dimension!=='Total').reduce((s,m)=>s+m.value,0),499891);
 assert.equal(metrics.filter(m=>m.category==='Core games'&&m.label==='Plays').reduce((s,m)=>s+m.value,0),18224);
 assert.equal(metrics.filter(m=>m.category==='Core games'&&m.label==='Unique players').reduce((s,m)=>s+m.value,0),4340);
 assert.equal(coreFrequency.length,5);
 assert.ok(metrics.some(m=>m.value===18620&&m.status==='Needs reconciliation'));
 assert.ok(metrics.some(m=>m.value===4587&&m.status==='Needs reconciliation'));
 assert.ok(metrics.filter(m=>m.category==='Core frequency'&&m.dimension==='Core games combined').every(m=>m.note&&m.status==='Needs reconciliation'));
 assert.equal(new Set(metrics.map(m=>m.id)).size,metrics.length);
 for(const metric of metrics){assert.ok(Number.isFinite(metric.value));assert.ok(metric.unit);assert.ok(metric.source);assert.ok(metric.period||metric.note);}
});
test('CSV exports all values, definitions, periods and provenance',()=>{
 const csv=csvText();assert.equal(csv.split('\r\n').length,metrics.length+1);assert.match(csv,/10798/);assert.match(csv,/Needs reconciliation/);assert.match(csv,/not revenue/);assert.match(csv,/Up to/);assert.match(csv,/page,status,note/);
 assert.ok(csv.startsWith('\uFEFF'));assert.ok(csvText([{...metrics[0],note:'one "quoted" note'}]).includes('one ""quoted"" note'));
});
test('supplied report is unchanged and media provenance is included',async()=>{
 const provenance=JSON.parse(await fs.readFile(new URL('../public/data/asset-provenance.json',import.meta.url)));
 for(const record of provenance.filter(r=>r.sha256)){const bytes=await fs.readFile(new URL('../'+record.file,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256,record.file);}
});
test('packaged game HTML matches accepted catalogue hashes',async()=>{
 const base=new URL('../demos/games/game-library/',import.meta.url);const catalogue=JSON.parse(await fs.readFile(new URL('catalogue.json',base)));
 for(const game of catalogue.games){const bytes=await fs.readFile(new URL(game.entry,base));assert.equal(bytes.length,game.bytes,game.id);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),game.sha256,game.id);}
});
