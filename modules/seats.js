// Rejection sampling avoids modulo bias; Fisher–Yates gives equal permutations.
export function randomInt(bound, source=()=>crypto.getRandomValues(new Uint32Array(1))[0]) {
 if(!Number.isInteger(bound)||bound<1||bound>0x100000000)throw new Error('잘못된 추첨 범위');
 const limit=0x100000000-(0x100000000%bound);let n;do{n=source()}while(n>=limit);return n%bound;
}
export function shuffle(values, pick=randomInt){const out=[...values];for(let i=out.length-1;i>0;i--){const j=pick(i+1);[out[i],out[j]]=[out[j],out[i]]}return out}
export function allocateSeats(names,total,empty,pattern='any',pick=randomInt){
 if(names.length!==total-empty.size)throw new Error('인원수와 사용할 자리 수를 맞추세요.');
 const out=Array(total).fill(null);if(pattern==='any'){const pool=shuffle(names,pick);for(let i=0;i<total;i++)if(!empty.has(i))out[i]=pool.shift();return out}
 if(!['MMFF','MFFM'].includes(pattern))throw new Error('지원하지 않는 패턴입니다.');
 const pools={M:[],F:[]};for(const value of names){const match=value.match(/^(.+)\/(남|여)$/);if(!match)throw new Error('모든 이름 뒤에 /남 또는 /여를 붙이세요.');pools[match[2]==='남'?'M':'F'].push(value)}
 const need={M:0,F:0};for(let i=0;i<total;i++)if(!empty.has(i))need[pattern[i%4]]++;
 if(need.M!==pools.M.length||need.F!==pools.F.length)throw new Error(`이 패턴에는 남 ${need.M}명, 여 ${need.F}명이 필요합니다. 빈자리나 패턴을 조정하세요.`);
 pools.M=shuffle(pools.M,pick);pools.F=shuffle(pools.F,pick);for(let i=0;i<total;i++)if(!empty.has(i))out[i]=pools[pattern[i%4]].shift();return out;
}
export function validateSnapshot(d){
 if(!d||d.version!==1||!Number.isInteger(d.rows)||!Number.isInteger(d.cols)||d.rows<1||d.cols<1||d.rows>20||d.cols>20||typeof d.names!=='string'||!['any','MMFF','MFFM'].includes(d.pattern))throw new Error('저장된 배치가 없거나 형식이 잘못되었습니다.');
 const total=d.rows*d.cols;if(!Array.isArray(d.assignments)||d.assignments.length!==total||d.assignments.some(v=>v!==null&&typeof v!=='string')||!Array.isArray(d.empty)||!Array.isArray(d.revealed)||[...d.empty,...d.revealed].some(i=>!Number.isInteger(i)||i<0||i>=total))throw new Error('자리 데이터가 손상되었습니다.');return d;
}
