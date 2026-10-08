const assert=require('node:assert/strict');
(async()=>{const {allocateSeats,shuffle,randomInt,validateSnapshot}=await import('../modules/seats.js');
assert.deepEqual(allocateSeats(['A/남','B/남','C/여','D/여'],4,new Set(),'MMFF',()=>0).map(x=>x.split('/')[1]),['남','남','여','여']);
assert.deepEqual(allocateSeats(['A/남','B/남','C/여','D/여'],4,new Set(),'MFFM',()=>0).map(x=>x.split('/')[1]),['남','여','여','남']);
assert.equal(allocateSeats(['A/남','C/여','D/여'],4,new Set([3]),'MFFM',()=>0)[3],null);
assert.throws(()=>allocateSeats(['A','B'],2,new Set(),'MMFF'));assert.throws(()=>allocateSeats(['A/남','B/여'],2,new Set(),'MMFF'));
let draws=[0xffffffff,6];assert.equal(randomInt(3,()=>draws.shift()),0);assert.equal(draws.length,0);
// Exhaust every Fisher-Yates branch: six permutations for three people, equal count.
const permutations=new Map();for(let i=0;i<3;i++)for(let j=0;j<2;j++){let n=0;const out=shuffle(['A','B','C'],()=>[i,j][n++]).join('');permutations.set(out,(permutations.get(out)||0)+1)}assert.equal(permutations.size,6);assert([...permutations.values()].every(x=>x===1));
assert.throws(()=>validateSnapshot({version:1,rows:1,cols:1,names:'A',pattern:'any',empty:[],revealed:[],assignments:['A','B']}));
console.log('PASS gender patterns, blank seats, capacity, corrupt saves, unbiased permutations and rejection sampling');})().catch(e=>{console.error(e);process.exitCode=1});
