import {allocateSeats, validateSnapshot} from "../modules/seats.js";
(() => {
const $=id=>document.getElementById(id);
document.querySelectorAll('.tool-btn').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.tool').forEach(x=>x.classList.add('hidden'));
 document.querySelectorAll('.tool-btn').forEach(x=>x.classList.remove('active'));
 $(btn.dataset.tool).classList.remove('hidden');btn.classList.add('active');
 if(btn.dataset.tool==='world') updateWorld();
}));
/* calculator */
let calc='';
document.querySelectorAll('[data-calc]').forEach(b=>b.addEventListener('click',()=>{
 const v=b.dataset.calc;
 if(v==='C'){calc='';}
 else if(v==='='){
  try{if(!/^[0-9+*/(). -]+$/.test(calc))throw 0;const n=Function('"use strict";return ('+calc+')')();calc=Number.isFinite(n)?String(n):'';}catch{calc='';$('calcDisplay').value='오류';setTimeout(()=>$('calcDisplay').value=calc||'0',700);return;}
 }else calc+=v;
 $('calcDisplay').value=calc||'0';
}));
/* timer */
let timerId=null,timerLeft=60,timerDeadline=0;
function timerRead(){const m=Math.max(0,parseInt($('timerMin').value)||0),s=Math.max(0,Math.min(59,parseInt($('timerSec').value)||0));return m*60+s}
function timerRender(){let s=Math.max(0,timerLeft);$('timerDisplay').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function timerTick(){
 timerLeft=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));timerRender();
 if(timerLeft===0){clearInterval(timerId);timerId=null;timerDeadline=0;alert('⏱️ 타이머가 끝났습니다!')}
}
$('timerStart').onclick=()=>{if(timerId!==null)return;if(timerLeft<=0)timerLeft=timerRead();if(timerLeft<=0)return;timerDeadline=Date.now()+timerLeft*1000;timerId=setInterval(timerTick,200);timerTick()};
$('timerPause').onclick=()=>{if(timerId!==null)timerLeft=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));clearInterval(timerId);timerId=null;timerDeadline=0;timerRender()};
$('timerReset').onclick=()=>{clearInterval(timerId);timerId=null;timerDeadline=0;timerLeft=timerRead();timerRender()};
$('timerMin').oninput=$('timerSec').oninput=()=>{if(timerId===null){timerLeft=timerRead();timerRender()}};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&timerId!==null)timerTick()});
/* stopwatch */
let swStart=0,swElapsed=0,swId=null;
function swRender(){const t=swElapsed+(swId?Date.now()-swStart:0);const cs=Math.floor(t/10)%100,s=Math.floor(t/1000)%60,m=Math.floor(t/60000);$('swDisplay').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(cs).padStart(2,'0')}
$('swStart').onclick=()=>{if(swId){swElapsed+=Date.now()-swStart;clearInterval(swId);swId=null;swRender();$('swStart').textContent='계속'}else{swStart=Date.now();swId=setInterval(swRender,30);$('swStart').textContent='일시정지'}};
$('swLap').onclick=()=>{if(!swId)return;const t=swElapsed+Date.now()-swStart;if(!$('laps').dataset.has){$('laps').textContent='';$('laps').dataset.has='1'}const d=document.createElement('div');d.textContent='랩 '+($('laps').children.length+1)+': '+(t/1000).toFixed(2)+'초';$('laps').appendChild(d)};
$('swReset').onclick=()=>{clearInterval(swId);swId=null;swElapsed=0;$('swStart').textContent='시작';$('swDisplay').textContent='00:00.00';$('laps').textContent='랩 기록이 여기에 표시됩니다.';delete $('laps').dataset.has};
/* random */
$('pickBtn').onclick=()=>{const a=$('randomItems').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean);$('pickResult').textContent=a.length?a[Math.floor(Math.random()*a.length)]:'항목을 입력해주세요.'};
$('numberBtn').onclick=()=>{let a=Math.ceil(Number($('numMin').value)),b=Math.floor(Number($('numMax').value));if(a>b)[a,b]=[b,a];$('numberResult').textContent=Number.isFinite(a)&&Number.isFinite(b)?String(Math.floor(Math.random()*(b-a+1))+a):'숫자를 입력해주세요.'};
/* password */
$('pwBtn').onclick=()=>{let len=Math.max(4,Math.min(128,Number($('pwLen').value)||16));const sets={all:'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=',letters:'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',simple:'abcdefghijkmnopqrstuvwxyz23456789'};const chars=sets[$('pwMode').value];const arr=new Uint32Array(len);crypto.getRandomValues(arr);let out='';for(let i=0;i<len;i++)out+=chars[arr[i]%chars.length];$('pwResult').textContent=out};
/* memo (localStorage may be unavailable) */
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}},del(k){try{localStorage.removeItem(k)}catch{}}};
$('memoText').value=store.get('fw_tool_memo')||'';
$('memoText').addEventListener('input',()=>store.set('fw_tool_memo',$('memoText').value));
$('memoClear').onclick=()=>{$('memoText').value='';store.del('fw_tool_memo')};
/* todo */
let todos=[];try{todos=JSON.parse(store.get('fw_tool_todos')||'[]')}catch{todos=[]}
function renderTodos(){const box=$('todoList');box.innerHTML='';todos.forEach((t,i)=>{const row=document.createElement('div');row.className='check-item';const c=document.createElement('input');c.type='checkbox';c.style.width='auto';c.checked=t.done;c.onchange=()=>{t.done=c.checked;saveTodos()};const s=document.createElement('span');s.textContent=t.text;if(t.done)s.className='done';const d=document.createElement('button');d.className='action danger';d.textContent='삭제';d.onclick=()=>{todos.splice(i,1);saveTodos()};row.append(c,s,d);box.appendChild(row)})}
function saveTodos(){store.set('fw_tool_todos',JSON.stringify(todos));renderTodos()}
$('todoAdd').onclick=()=>{const v=$('todoInput').value.trim();if(v){todos.push({text:v,done:false});$('todoInput').value='';saveTodos()}};
$('todoInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('todoAdd').click()});
renderTodos();
/* units */
const unitData={length:{m:1,cm:.01,mm:.001,km:1000,ft:.3048},weight:{kg:1,g:.001,mg:.000001,lb:.45359237},temp:null};
const unitLabels={length:{m:'m',cm:'cm',mm:'mm',km:'km',ft:'ft'},weight:{kg:'kg',g:'g',mg:'mg',lb:'lb'},temp:{c:'°C',f:'°F',k:'K'}};
function fillUnits(){const type=$('unitType').value;const opts=Object.keys(unitLabels[type]);const html=opts.map(x=>`<option value="${x}">${unitLabels[type][x]}</option>`).join('');$('unitFrom').innerHTML=html;$('unitTo').innerHTML=html;if(opts.length>1)$('unitTo').selectedIndex=1}
$('unitType').onchange=fillUnits;fillUnits();
$('unitBtn').onclick=()=>{
 const type=$('unitType').value,v=Number($('unitValue').value),a=$('unitFrom').value,b=$('unitTo').value;
 if(!Number.isFinite(v))return;
 let out;
 if(type==='temp'){
  let c=a==='c'?v:a==='f'?(v-32)*5/9:v-273.15;
  out=b==='c'?c:b==='f'?c*9/5+32:c+273.15;
 }else out=v*unitData[type][a]/unitData[type][b];
 $('unitResult').textContent=String(Math.round(out*1e8)/1e8)+' '+unitLabels[type][b];
};
/* date */
const today=new Date();$('dateA').valueAsDate=today;$('dateB').valueAsDate=today;
$('dateBtn').onclick=()=>{const a=new Date($('dateA').value+'T00:00:00'),b=new Date($('dateB').value+'T00:00:00');if(isNaN(a)||isNaN(b))return;$('dateResult').textContent=Math.abs(Math.round((b-a)/86400000))+'일 차이입니다.'};
$('ddayBtn').onclick=()=>{
 const v=$('ddayDate').value;if(!v)return;
 const t=new Date(v+'T00:00:00'),n=new Date(new Date().toDateString());
 const diff=Math.round((t-n)/86400000);
 $('ddayResult').textContent=diff===0?'D-Day!':diff>0?'D-'+diff:'D+'+Math.abs(diff);
};
/* math */
function renderMathInputs(){const t=$('mathType').value;const box=$('mathInputs');box.innerHTML=t==='circle'?'<div class="field"><label>반지름 r</label><input id="mx" type="number" value="5"></div>':t==='avg'?'<div class="field"><label>숫자 (쉼표로 구분)</label><input id="mx" value="10,20,30"></div>':'<div class="field"><label>a</label><input id="mx" type="number" value="3"></div><div class="field"><label>b</label><input id="my" type="number" value="4"></div>'}
$('mathType').onchange=renderMathInputs;renderMathInputs();
$('mathBtn').onclick=()=>{const t=$('mathType').value;if(t==='circle'){const r=Number($('mx').value);$('mathResult').textContent=`넓이 ${(Math.PI*r*r).toFixed(2)} · 둘레 ${(2*Math.PI*r).toFixed(2)}`}else if(t==='avg'){const a=$('mx').value.split(',').map(x=>x.trim()).filter(x=>x!=='').map(Number).filter(Number.isFinite);$('mathResult').textContent=a.length?'평균 '+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(4):'숫자를 입력해주세요.'}else{const a=Number($('mx').value),b=Number($('my').value);$('mathResult').textContent='c = '+Math.hypot(a,b).toFixed(4)}};
/* ratio */
$('ratioBtn').onclick=()=>{const a=Number($('ra').value),b=Number($('rb').value),c=Number($('rc').value);$('ratioResult').textContent=a?'D = '+(b*c/a):'A는 0이 될 수 없습니다.'};
/* color */
function updateColor(){const h=$('colorPicker').value;const n=parseInt(h.slice(1),16);$('colorResult').textContent=`HEX ${h.toUpperCase()} · RGB ${(n>>16)&255}, ${(n>>8)&255}, ${n&255}`}
$('colorPicker').oninput=updateColor;updateColor();
/* text */
$('textInput').oninput=()=>{const v=$('textInput').value;$('textResult').textContent=`글자 수: ${v.length} · 공백 제외: ${v.replace(/\s/g,'').length} · 줄 수: ${v? v.split(/\n/).length:0}`};
/* world */
function updateWorld(){const cities=[['서울','Asia/Seoul'],['도쿄','Asia/Tokyo'],['런던','Europe/London'],['뉴욕','America/New_York'],['로스앤젤레스','America/Los_Angeles'],['시드니','Australia/Sydney']];$('worldTimes').innerHTML=cities.map(([n,t])=>`${n}: ${new Intl.DateTimeFormat('ko-KR',{timeZone:t,dateStyle:'medium',timeStyle:'medium'}).format(new Date())}`).join('<br>')}
updateWorld();setInterval(updateWorld,1000);
/* voice changer */
let voiceCtx=null,voiceStream=null,voiceSource=null,voiceNodes=[],voiceAnalyser=null,voiceMeterId=null;
const voiceAmount=$('voiceAmount'),voiceAmountValue=$('voiceAmountValue');
voiceAmount.oninput=()=>{voiceAmountValue.textContent=voiceAmount.value+'%';connectVoiceEffect()};

function disconnectVoice(){
  if(voiceSource){try{voiceSource.disconnect()}catch{}if(voiceAnalyser){try{voiceSource.connect(voiceAnalyser)}catch{}}}
  voiceNodes.forEach(n=>{try{n.disconnect()}catch{}});
  voiceNodes=[];
}
function connectVoiceEffect(){
  if(!voiceCtx||!voiceSource)return;
  disconnectVoice();
  const effect=$('voiceEffect').value, amount=Number(voiceAmount.value)/100;
  let input=voiceSource, output=voiceCtx.destination;
  const nodes=[];
  if(effect==='normal'){
    input.connect(output);
  }else if(effect==='deep'){
    const f=voiceCtx.createBiquadFilter();f.type='lowshelf';f.frequency.value=700;f.gain.value=12+18*amount;
    input.connect(f);f.connect(output);nodes.push(f);
  }else if(effect==='high'){
    const f=voiceCtx.createBiquadFilter();f.type='highshelf';f.frequency.value=1800;f.gain.value=8+16*amount;
    input.connect(f);f.connect(output);nodes.push(f);
  }else if(effect==='megaphone'){
    const hp=voiceCtx.createBiquadFilter();hp.type='highpass';hp.frequency.value=550;
    const lp=voiceCtx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3500;
    const comp=voiceCtx.createDynamicsCompressor();
    input.connect(hp);hp.connect(lp);lp.connect(comp);comp.connect(output);nodes.push(hp,lp,comp);
  }else if(effect==='echo'){
    const delay=voiceCtx.createDelay(2);delay.delayTime.value=.12+.38*amount;
    const fb=voiceCtx.createGain();fb.gain.value=.15+.5*amount;
    input.connect(delay);delay.connect(fb);fb.connect(delay);delay.connect(output);input.connect(output);
    nodes.push(delay,fb);
  }else if(effect==='robot'){
    const band=voiceCtx.createBiquadFilter();band.type='bandpass';band.frequency.value=650;band.Q.value=1.1+amount*4;
    const delay=voiceCtx.createDelay(1);delay.delayTime.value=.025+.06*amount;
    const fb=voiceCtx.createGain();fb.gain.value=.2+.25*amount;
    input.connect(band);band.connect(delay);delay.connect(fb);fb.connect(delay);delay.connect(output);band.connect(output);
    nodes.push(band,delay,fb);
  }else if(effect==='distort'){
    const sh=voiceCtx.createWaveShaper();
    const curve=new Float32Array(44100),k=10+90*amount;
    for(let i=0;i<curve.length;i++){const x=i*2/curve.length-1;curve[i]=(3+k)*x*20*Math.PI/180/(Math.PI+k*Math.abs(x));}
    sh.curve=curve;sh.oversample='4x';
    input.connect(sh);sh.connect(output);nodes.push(sh);
  }
  voiceNodes=nodes;
}
async function startVoice(){
  try{
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){$('voiceStatus').textContent='이 브라우저(또는 http 환경)에서는 마이크를 사용할 수 없습니다. https로 접속해주세요.';return}
    if(voiceStream)stopVoice();
    if(!voiceCtx)voiceCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(voiceCtx.state==='suspended')await voiceCtx.resume();
    voiceStream=await navigator.mediaDevices.getUserMedia({audio:true});
    voiceSource=voiceCtx.createMediaStreamSource(voiceStream);
    voiceAnalyser=voiceCtx.createAnalyser();voiceAnalyser.fftSize=256;
    voiceSource.connect(voiceAnalyser);
    connectVoiceEffect();
    $('voiceStatus').textContent='마이크가 작동 중입니다. 선택한 효과가 실시간 적용됩니다.';
    if(voiceMeterId)cancelAnimationFrame(voiceMeterId);
    const data=new Uint8Array(voiceAnalyser.frequencyBinCount);
    const meter=()=>{
      if(!voiceAnalyser)return;
      voiceAnalyser.getByteTimeDomainData(data);
      let sum=0;for(const x of data){const v=(x-128)/128;sum+=v*v}
      $('voiceMeter').style.width=Math.min(100,Math.sqrt(sum/data.length)*180)+'%';
      voiceMeterId=requestAnimationFrame(meter);
    };meter();
  }catch(e){$('voiceStatus').textContent='마이크를 사용할 수 없습니다. 브라우저의 마이크 권한을 확인해주세요.'}
}
function stopVoice(){
  if(voiceStream)voiceStream.getTracks().forEach(t=>t.stop());
  voiceStream=null;
  if(voiceSource){try{voiceSource.disconnect()}catch{}}
  voiceNodes.forEach(n=>{try{n.disconnect()}catch{}});voiceNodes=[];
  voiceSource=null;voiceAnalyser=null;
  if(voiceMeterId)cancelAnimationFrame(voiceMeterId);
  $('voiceMeter').style.width='0%';$('voiceStatus').textContent='마이크가 중지되었습니다.';
}
$('voiceStart').onclick=startVoice;
$('voiceStop').onclick=stopVoice;
$('voiceEffect').onchange=()=>{
  document.querySelectorAll('[data-voice-effect]').forEach(x=>x.classList.toggle('active',x.dataset.voiceEffect===$('voiceEffect').value));
  connectVoiceEffect();
};
document.querySelectorAll('[data-voice-effect]').forEach(b=>b.onclick=()=>{
  $('voiceEffect').value=b.dataset.voiceEffect;
  document.querySelectorAll('[data-voice-effect]').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');connectVoiceEffect();
});
document.querySelector('[data-voice-effect="normal"]').classList.add('active');

/* video speed */
let videoUrl=null;
$('videoFile').onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  if(videoUrl)URL.revokeObjectURL(videoUrl);
  videoUrl=URL.createObjectURL(file);
  $('videoPreview').src=videoUrl;$('videoPreview').load();
  $('videoPreview').playbackRate=Number($('videoSpeed').value);
  $('videoStatus').textContent=`${file.name} · ${(file.size/1024/1024).toFixed(1)}MB`;
};
function setVideoSpeed(v){
  $('videoSpeed').value=v;$('videoSpeedValue').textContent=Number(v).toFixed(2)+'×';$('videoPreview').playbackRate=Number(v);
}
$('videoSpeed').oninput=e=>setVideoSpeed(e.target.value);
$('videoPreview').addEventListener('loadedmetadata',()=>{$('videoPreview').playbackRate=Number($('videoSpeed').value)});
document.querySelectorAll('[data-video-speed]').forEach(b=>b.onclick=()=>setVideoSpeed(b.dataset.videoSpeed));

/* audio tools */
let audioUrl=null;
$('audioFile').onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  if(audioUrl)URL.revokeObjectURL(audioUrl);
  audioUrl=URL.createObjectURL(file);$('audioPreview').src=audioUrl;$('audioPreview').load();
  $('audioPreview').playbackRate=Number($('audioSpeed').value);
  $('audioPreview').volume=Number($('audioVolume').value)/100;
  $('audioStatus').textContent=`${file.name} · ${(file.size/1024/1024).toFixed(1)}MB`;
};
$('audioSpeed').oninput=e=>{$('audioSpeedValue').textContent=Number(e.target.value).toFixed(2)+'×';$('audioPreview').playbackRate=Number(e.target.value)};
$('audioPreview').addEventListener('loadedmetadata',()=>{$('audioPreview').playbackRate=Number($('audioSpeed').value)});
$('audioVolume').oninput=e=>{$('audioVolumeValue').textContent=e.target.value+'%';$('audioPreview').volume=Number(e.target.value)/100};

// QRCode encoder: Copyright (c) 2009 Kazuhiko Arase, MIT license. Source attribution preserved in modules.
const LocalQRCode=(()=>{const modules={"./QR8bitByte":function(require,module,exports){
var QRMode = require('./QRMode');

function QR8bitByte(data) {
	this.mode = QRMode.MODE_8BIT_BYTE;
	this.data = data;
}

QR8bitByte.prototype = {

	getLength : function() {
		return this.data.length;
	},
	
	write : function(buffer) {
		for (var i = 0; i < this.data.length; i++) {
			// not JIS ...
			buffer.put(this.data.charCodeAt(i), 8);
		}
	}
};

module.exports = QR8bitByte;

},"./QRBitBuffer":function(require,module,exports){
function QRBitBuffer() {
	this.buffer = [];
	this.length = 0;
}

QRBitBuffer.prototype = {

	get : function(index) {
		var bufIndex = Math.floor(index / 8);
		return ( (this.buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	},
	
	put : function(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
		}
	},
	
	getLengthInBits : function() {
		return this.length;
	},
	
	putBit : function(bit) {
	
		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
	
		if (bit) {
			this.buffer[bufIndex] |= (0x80 >>> (this.length % 8) );
		}
	
		this.length++;
	}
};

module.exports = QRBitBuffer;

},"./QRErrorCorrectLevel":function(require,module,exports){
module.exports = {
	L : 1,
	M : 0,
	Q : 3,
	H : 2
};


},"./QRMaskPattern":function(require,module,exports){
module.exports = {
	PATTERN000 : 0,
	PATTERN001 : 1,
	PATTERN010 : 2,
	PATTERN011 : 3,
	PATTERN100 : 4,
	PATTERN101 : 5,
	PATTERN110 : 6,
	PATTERN111 : 7
};

},"./QRMath":function(require,module,exports){
var QRMath = {

	glog : function(n) {
	
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		
		return QRMath.LOG_TABLE[n];
	},
	
	gexp : function(n) {
	
		while (n < 0) {
			n += 255;
		}
	
		while (n >= 256) {
			n -= 255;
		}
	
		return QRMath.EXP_TABLE[n];
	},
	
	EXP_TABLE : new Array(256),
	
	LOG_TABLE : new Array(256)

};
	
for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4]
		^ QRMath.EXP_TABLE[i - 5]
		^ QRMath.EXP_TABLE[i - 6]
		^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i] ] = i;
}

module.exports = QRMath;

},"./QRMode":function(require,module,exports){
module.exports = {
    MODE_NUMBER :       1 << 0,
    MODE_ALPHA_NUM :    1 << 1,
    MODE_8BIT_BYTE :    1 << 2,
    MODE_KANJI :        1 << 3
};

},"./QRPolynomial":function(require,module,exports){
var QRMath = require('./QRMath');

function QRPolynomial(num, shift) {
	if (num.length === undefined) {
		throw new Error(num.length + "/" + shift);
	}

	var offset = 0;

	while (offset < num.length && num[offset] === 0) {
		offset++;
	}

	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}

QRPolynomial.prototype = {

	get : function(index) {
		return this.num[index];
	},
	
	getLength : function() {
		return this.num.length;
	},
	
	multiply : function(e) {
	
		var num = new Array(this.getLength() + e.getLength() - 1);
	
		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i) ) + QRMath.glog(e.get(j) ) );
			}
		}
	
		return new QRPolynomial(num, 0);
	},
	
	mod : function(e) {
	
		if (this.getLength() - e.getLength() < 0) {
			return this;
		}
	
		var ratio = QRMath.glog(this.get(0) ) - QRMath.glog(e.get(0) );
	
		var num = new Array(this.getLength() );
		
		for (var i = 0; i < this.getLength(); i++) {
			num[i] = this.get(i);
		}
		
		for (var x = 0; x < e.getLength(); x++) {
			num[x] ^= QRMath.gexp(QRMath.glog(e.get(x) ) + ratio);
		}
	
		// recursive call
		return new QRPolynomial(num, 0).mod(e);
	}
};

module.exports = QRPolynomial;

},"./QRRSBlock":function(require,module,exports){
var QRErrorCorrectLevel = require('./QRErrorCorrectLevel');

function QRRSBlock(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount  = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [

	// L
	// M
	// Q
	// H

	// 1
	[1, 26, 19],
	[1, 26, 16],
	[1, 26, 13],
	[1, 26, 9],
	
	// 2
	[1, 44, 34],
	[1, 44, 28],
	[1, 44, 22],
	[1, 44, 16],

	// 3
	[1, 70, 55],
	[1, 70, 44],
	[2, 35, 17],
	[2, 35, 13],

	// 4		
	[1, 100, 80],
	[2, 50, 32],
	[2, 50, 24],
	[4, 25, 9],
	
	// 5
	[1, 134, 108],
	[2, 67, 43],
	[2, 33, 15, 2, 34, 16],
	[2, 33, 11, 2, 34, 12],
	
	// 6
	[2, 86, 68],
	[4, 43, 27],
	[4, 43, 19],
	[4, 43, 15],
	
	// 7		
	[2, 98, 78],
	[4, 49, 31],
	[2, 32, 14, 4, 33, 15],
	[4, 39, 13, 1, 40, 14],
	
	// 8
	[2, 121, 97],
	[2, 60, 38, 2, 61, 39],
	[4, 40, 18, 2, 41, 19],
	[4, 40, 14, 2, 41, 15],
	
	// 9
	[2, 146, 116],
	[3, 58, 36, 2, 59, 37],
	[4, 36, 16, 4, 37, 17],
	[4, 36, 12, 4, 37, 13],
	
	// 10		
	[2, 86, 68, 2, 87, 69],
	[4, 69, 43, 1, 70, 44],
	[6, 43, 19, 2, 44, 20],
	[6, 43, 15, 2, 44, 16],

	// 11
	[4, 101, 81],
	[1, 80, 50, 4, 81, 51],
	[4, 50, 22, 4, 51, 23],
	[3, 36, 12, 8, 37, 13],

	// 12
	[2, 116, 92, 2, 117, 93],
	[6, 58, 36, 2, 59, 37],
	[4, 46, 20, 6, 47, 21],
	[7, 42, 14, 4, 43, 15],

	// 13
	[4, 133, 107],
	[8, 59, 37, 1, 60, 38],
	[8, 44, 20, 4, 45, 21],
	[12, 33, 11, 4, 34, 12],

	// 14
	[3, 145, 115, 1, 146, 116],
	[4, 64, 40, 5, 65, 41],
	[11, 36, 16, 5, 37, 17],
	[11, 36, 12, 5, 37, 13],

	// 15
	[5, 109, 87, 1, 110, 88],
	[5, 65, 41, 5, 66, 42],
	[5, 54, 24, 7, 55, 25],
	[11, 36, 12],

	// 16
	[5, 122, 98, 1, 123, 99],
	[7, 73, 45, 3, 74, 46],
	[15, 43, 19, 2, 44, 20],
	[3, 45, 15, 13, 46, 16],

	// 17
	[1, 135, 107, 5, 136, 108],
	[10, 74, 46, 1, 75, 47],
	[1, 50, 22, 15, 51, 23],
	[2, 42, 14, 17, 43, 15],

	// 18
	[5, 150, 120, 1, 151, 121],
	[9, 69, 43, 4, 70, 44],
	[17, 50, 22, 1, 51, 23],
	[2, 42, 14, 19, 43, 15],

	// 19
	[3, 141, 113, 4, 142, 114],
	[3, 70, 44, 11, 71, 45],
	[17, 47, 21, 4, 48, 22],
	[9, 39, 13, 16, 40, 14],

	// 20
	[3, 135, 107, 5, 136, 108],
	[3, 67, 41, 13, 68, 42],
	[15, 54, 24, 5, 55, 25],
	[15, 43, 15, 10, 44, 16],

	// 21
	[4, 144, 116, 4, 145, 117],
	[17, 68, 42],
	[17, 50, 22, 6, 51, 23],
	[19, 46, 16, 6, 47, 17],

	// 22
	[2, 139, 111, 7, 140, 112],
	[17, 74, 46],
	[7, 54, 24, 16, 55, 25],
	[34, 37, 13],

	// 23
	[4, 151, 121, 5, 152, 122],
	[4, 75, 47, 14, 76, 48],
	[11, 54, 24, 14, 55, 25],
	[16, 45, 15, 14, 46, 16],

	// 24
	[6, 147, 117, 4, 148, 118],
	[6, 73, 45, 14, 74, 46],
	[11, 54, 24, 16, 55, 25],
	[30, 46, 16, 2, 47, 17],

	// 25
	[8, 132, 106, 4, 133, 107],
	[8, 75, 47, 13, 76, 48],
	[7, 54, 24, 22, 55, 25],
	[22, 45, 15, 13, 46, 16],

	// 26
	[10, 142, 114, 2, 143, 115],
	[19, 74, 46, 4, 75, 47],
	[28, 50, 22, 6, 51, 23],
	[33, 46, 16, 4, 47, 17],

	// 27
	[8, 152, 122, 4, 153, 123],
	[22, 73, 45, 3, 74, 46],
	[8, 53, 23, 26, 54, 24],
	[12, 45, 15, 28, 46, 16],

	// 28
	[3, 147, 117, 10, 148, 118],
	[3, 73, 45, 23, 74, 46],
	[4, 54, 24, 31, 55, 25],
	[11, 45, 15, 31, 46, 16],

	// 29
	[7, 146, 116, 7, 147, 117],
	[21, 73, 45, 7, 74, 46],
	[1, 53, 23, 37, 54, 24],
	[19, 45, 15, 26, 46, 16],

	// 30
	[5, 145, 115, 10, 146, 116],
	[19, 75, 47, 10, 76, 48],
	[15, 54, 24, 25, 55, 25],
	[23, 45, 15, 25, 46, 16],

	// 31
	[13, 145, 115, 3, 146, 116],
	[2, 74, 46, 29, 75, 47],
	[42, 54, 24, 1, 55, 25],
	[23, 45, 15, 28, 46, 16],

	// 32
	[17, 145, 115],
	[10, 74, 46, 23, 75, 47],
	[10, 54, 24, 35, 55, 25],
	[19, 45, 15, 35, 46, 16],

	// 33
	[17, 145, 115, 1, 146, 116],
	[14, 74, 46, 21, 75, 47],
	[29, 54, 24, 19, 55, 25],
	[11, 45, 15, 46, 46, 16],

	// 34
	[13, 145, 115, 6, 146, 116],
	[14, 74, 46, 23, 75, 47],
	[44, 54, 24, 7, 55, 25],
	[59, 46, 16, 1, 47, 17],

	// 35
	[12, 151, 121, 7, 152, 122],
	[12, 75, 47, 26, 76, 48],
	[39, 54, 24, 14, 55, 25],
	[22, 45, 15, 41, 46, 16],

	// 36
	[6, 151, 121, 14, 152, 122],
	[6, 75, 47, 34, 76, 48],
	[46, 54, 24, 10, 55, 25],
	[2, 45, 15, 64, 46, 16],

	// 37
	[17, 152, 122, 4, 153, 123],
	[29, 74, 46, 14, 75, 47],
	[49, 54, 24, 10, 55, 25],
	[24, 45, 15, 46, 46, 16],

	// 38
	[4, 152, 122, 18, 153, 123],
	[13, 74, 46, 32, 75, 47],
	[48, 54, 24, 14, 55, 25],
	[42, 45, 15, 32, 46, 16],

	// 39
	[20, 147, 117, 4, 148, 118],
	[40, 75, 47, 7, 76, 48],
	[43, 54, 24, 22, 55, 25],
	[10, 45, 15, 67, 46, 16],

	// 40
	[19, 148, 118, 6, 149, 119],
	[18, 75, 47, 31, 76, 48],
	[34, 54, 24, 34, 55, 25],
	[20, 45, 15, 61, 46, 16]
];

QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
	
	var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
	
	if (rsBlock === undefined) {
		throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	}

	var length = rsBlock.length / 3;
	
	var list = [];
	
	for (var i = 0; i < length; i++) {

		var count = rsBlock[i * 3 + 0];
		var totalCount = rsBlock[i * 3 + 1];
		var dataCount  = rsBlock[i * 3 + 2];

		for (var j = 0; j < count; j++) {
			list.push(new QRRSBlock(totalCount, dataCount) );	
		}
	}
	
	return list;
};

QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {

	switch(errorCorrectLevel) {
	case QRErrorCorrectLevel.L :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	case QRErrorCorrectLevel.M :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	case QRErrorCorrectLevel.Q :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	case QRErrorCorrectLevel.H :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	default :
		return undefined;
	}
};

module.exports = QRRSBlock;

},"./QRUtil":function(require,module,exports){
var QRMode = require('./QRMode');
var QRPolynomial = require('./QRPolynomial');
var QRMath = require('./QRMath');
var QRMaskPattern = require('./QRMaskPattern');

var QRUtil = {

    PATTERN_POSITION_TABLE : [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],        
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ],

    G15 : (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18 : (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK : (1 << 14) | (1 << 12) | (1 << 10)    | (1 << 4) | (1 << 1),

    getBCHTypeInfo : function(data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) ) );    
        }
        return ( (data << 10) | d) ^ QRUtil.G15_MASK;
    },

    getBCHTypeNumber : function(data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) ) );    
        }
        return (data << 12) | d;
    },

    getBCHDigit : function(data) {

        var digit = 0;

        while (data !== 0) {
            digit++;
            data >>>= 1;
        }

        return digit;
    },

    getPatternPosition : function(typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },

    getMask : function(maskPattern, i, j) {
        
        switch (maskPattern) {
            
        case QRMaskPattern.PATTERN000 : return (i + j) % 2 === 0;
        case QRMaskPattern.PATTERN001 : return i % 2 === 0;
        case QRMaskPattern.PATTERN010 : return j % 3 === 0;
        case QRMaskPattern.PATTERN011 : return (i + j) % 3 === 0;
        case QRMaskPattern.PATTERN100 : return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 === 0;
        case QRMaskPattern.PATTERN101 : return (i * j) % 2 + (i * j) % 3 === 0;
        case QRMaskPattern.PATTERN110 : return ( (i * j) % 2 + (i * j) % 3) % 2 === 0;
        case QRMaskPattern.PATTERN111 : return ( (i * j) % 3 + (i + j) % 2) % 2 === 0;

        default :
            throw new Error("bad maskPattern:" + maskPattern);
        }
    },

    getErrorCorrectPolynomial : function(errorCorrectLength) {

        var a = new QRPolynomial([1], 0);

        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0) );
        }

        return a;
    },

    getLengthInBits : function(mode, type) {

        if (1 <= type && type < 10) {

            // 1 - 9

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 10;
            case QRMode.MODE_ALPHA_NUM  : return 9;
            case QRMode.MODE_8BIT_BYTE  : return 8;
            case QRMode.MODE_KANJI      : return 8;
            default :
                throw new Error("mode:" + mode);
            }

        } else if (type < 27) {

            // 10 - 26

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 12;
            case QRMode.MODE_ALPHA_NUM  : return 11;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 10;
            default :
                throw new Error("mode:" + mode);
            }

        } else if (type < 41) {

            // 27 - 40

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 14;
            case QRMode.MODE_ALPHA_NUM  : return 13;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 12;
            default :
                throw new Error("mode:" + mode);
            }

        } else {
            throw new Error("type:" + type);
        }
    },

    getLostPoint : function(qrCode) {
        
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        var row = 0; 
        var col = 0;

        
        // LEVEL1
        
        for (row = 0; row < moduleCount; row++) {

            for (col = 0; col < moduleCount; col++) {

                var sameCount = 0;
                var dark = qrCode.isDark(row, col);

                for (var r = -1; r <= 1; r++) {

                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }

                    for (var c = -1; c <= 1; c++) {

                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }

                        if (r === 0 && c === 0) {
                            continue;
                        }

                        if (dark === qrCode.isDark(row + r, col + c) ) {
                            sameCount++;
                        }
                    }
                }

                if (sameCount > 5) {
                    lostPoint += (3 + sameCount - 5);
                }
            }
        }

        // LEVEL2

        for (row = 0; row < moduleCount - 1; row++) {
            for (col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrCode.isDark(row,     col    ) ) count++;
                if (qrCode.isDark(row + 1, col    ) ) count++;
                if (qrCode.isDark(row,     col + 1) ) count++;
                if (qrCode.isDark(row + 1, col + 1) ) count++;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }

        // LEVEL3

        for (row = 0; row < moduleCount; row++) {
            for (col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col) && 
                        !qrCode.isDark(row, col + 1) && 
                         qrCode.isDark(row, col + 2) && 
                         qrCode.isDark(row, col + 3) && 
                         qrCode.isDark(row, col + 4) && 
                        !qrCode.isDark(row, col + 5) && 
                         qrCode.isDark(row, col + 6) ) {
                    lostPoint += 40;
                }
            }
        }

        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col) &&
                        !qrCode.isDark(row + 1, col) &&
                         qrCode.isDark(row + 2, col) &&
                         qrCode.isDark(row + 3, col) &&
                         qrCode.isDark(row + 4, col) &&
                        !qrCode.isDark(row + 5, col) &&
                         qrCode.isDark(row + 6, col) ) {
                    lostPoint += 40;
                }
            }
        }

        // LEVEL4
        
        var darkCount = 0;

        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col) ) {
                    darkCount++;
                }
            }
        }
        
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;

        return lostPoint;       
    }

};

module.exports = QRUtil;

},"./index":function(require,module,exports){
//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of 
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
// Modified to work in node for this project (and some refactoring)
//---------------------------------------------------------------------

var QR8bitByte = require('./QR8bitByte');
var QRUtil = require('./QRUtil');
var QRPolynomial = require('./QRPolynomial');
var QRRSBlock = require('./QRRSBlock');
var QRBitBuffer = require('./QRBitBuffer');

function QRCode(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = [];
}

QRCode.prototype = {
	
	addData : function(data) {
		var newData = new QR8bitByte(data);
		this.dataList.push(newData);
		this.dataCache = null;
	},
	
	isDark : function(row, col) {
		if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
			throw new Error(row + "," + col);
		}
		return this.modules[row][col];
	},

	getModuleCount : function() {
		return this.moduleCount;
	},
	
	make : function() {
		// Calculate automatically typeNumber if provided is < 1
		if (this.typeNumber < 1 ){
			var typeNumber = 1;
			for (typeNumber = 1; typeNumber < 40; typeNumber++) {
				var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);

				var buffer = new QRBitBuffer();
				var totalDataCount = 0;
				for (var i = 0; i < rsBlocks.length; i++) {
					totalDataCount += rsBlocks[i].dataCount;
				}

				for (var x = 0; x < this.dataList.length; x++) {
					var data = this.dataList[x];
					buffer.put(data.mode, 4);
					buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
					data.write(buffer);
				}
				if (buffer.getLengthInBits() <= totalDataCount * 8)
					break;
			}
			this.typeNumber = typeNumber;
		}
		this.makeImpl(false, this.getBestMaskPattern() );
	},
	
	makeImpl : function(test, maskPattern) {
		
		this.moduleCount = this.typeNumber * 4 + 17;
		this.modules = new Array(this.moduleCount);
		
		for (var row = 0; row < this.moduleCount; row++) {
			
			this.modules[row] = new Array(this.moduleCount);
			
			for (var col = 0; col < this.moduleCount; col++) {
				this.modules[row][col] = null;//(col + row) % 3;
			}
		}
	
		this.setupPositionProbePattern(0, 0);
		this.setupPositionProbePattern(this.moduleCount - 7, 0);
		this.setupPositionProbePattern(0, this.moduleCount - 7);
		this.setupPositionAdjustPattern();
		this.setupTimingPattern();
		this.setupTypeInfo(test, maskPattern);
		
		if (this.typeNumber >= 7) {
			this.setupTypeNumber(test);
		}
	
		if (this.dataCache === null) {
			this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
		}
	
		this.mapData(this.dataCache, maskPattern);
	},

	setupPositionProbePattern : function(row, col)  {
		
		for (var r = -1; r <= 7; r++) {
			
			if (row + r <= -1 || this.moduleCount <= row + r) continue;
			
			for (var c = -1; c <= 7; c++) {
				
				if (col + c <= -1 || this.moduleCount <= col + c) continue;
				
				if ( (0 <= r && r <= 6 && (c === 0 || c === 6) ) || 
                     (0 <= c && c <= 6 && (r === 0 || r === 6) ) || 
                     (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
					this.modules[row + r][col + c] = true;
				} else {
					this.modules[row + r][col + c] = false;
				}
			}		
		}		
	},
	
	getBestMaskPattern : function() {
	
		var minLostPoint = 0;
		var pattern = 0;
	
		for (var i = 0; i < 8; i++) {
			
			this.makeImpl(true, i);
	
			var lostPoint = QRUtil.getLostPoint(this);
	
			if (i === 0 || minLostPoint >  lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
			}
		}
	
		return pattern;
	},
	
	createMovieClip : function(target_mc, instance_name, depth) {
	
		var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
		var cs = 1;
	
		this.make();

		for (var row = 0; row < this.modules.length; row++) {
			
			var y = row * cs;
			
			for (var col = 0; col < this.modules[row].length; col++) {
	
				var x = col * cs;
				var dark = this.modules[row][col];
			
				if (dark) {
					qr_mc.beginFill(0, 100);
					qr_mc.moveTo(x, y);
					qr_mc.lineTo(x + cs, y);
					qr_mc.lineTo(x + cs, y + cs);
					qr_mc.lineTo(x, y + cs);
					qr_mc.endFill();
				}
			}
		}
		
		return qr_mc;
	},

	setupTimingPattern : function() {
		
		for (var r = 8; r < this.moduleCount - 8; r++) {
			if (this.modules[r][6] !== null) {
				continue;
			}
			this.modules[r][6] = (r % 2 === 0);
		}
	
		for (var c = 8; c < this.moduleCount - 8; c++) {
			if (this.modules[6][c] !== null) {
				continue;
			}
			this.modules[6][c] = (c % 2 === 0);
		}
	},
	
	setupPositionAdjustPattern : function() {
	
		var pos = QRUtil.getPatternPosition(this.typeNumber);
		
		for (var i = 0; i < pos.length; i++) {
		
			for (var j = 0; j < pos.length; j++) {
			
				var row = pos[i];
				var col = pos[j];
				
				if (this.modules[row][col] !== null) {
					continue;
				}
				
				for (var r = -2; r <= 2; r++) {
				
					for (var c = -2; c <= 2; c++) {
					
						if (Math.abs(r) === 2 || 
                            Math.abs(c) === 2 ||
                            (r === 0 && c === 0) ) {
							this.modules[row + r][col + c] = true;
						} else {
							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	},
	
	setupTypeNumber : function(test) {
	
		var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        var mod;
	
		for (var i = 0; i < 18; i++) {
			mod = (!test && ( (bits >> i) & 1) === 1);
			this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
		}
	
		for (var x = 0; x < 18; x++) {
			mod = (!test && ( (bits >> x) & 1) === 1);
			this.modules[x % 3 + this.moduleCount - 8 - 3][Math.floor(x / 3)] = mod;
		}
	},
	
	setupTypeInfo : function(test, maskPattern) {
	
		var data = (this.errorCorrectLevel << 3) | maskPattern;
		var bits = QRUtil.getBCHTypeInfo(data);
        var mod;
	
		// vertical		
		for (var v = 0; v < 15; v++) {
	
			mod = (!test && ( (bits >> v) & 1) === 1);
	
			if (v < 6) {
				this.modules[v][8] = mod;
			} else if (v < 8) {
				this.modules[v + 1][8] = mod;
			} else {
				this.modules[this.moduleCount - 15 + v][8] = mod;
			}
		}
	
		// horizontal
		for (var h = 0; h < 15; h++) {
	
			mod = (!test && ( (bits >> h) & 1) === 1);
			
			if (h < 8) {
				this.modules[8][this.moduleCount - h - 1] = mod;
			} else if (h < 9) {
				this.modules[8][15 - h - 1 + 1] = mod;
			} else {
				this.modules[8][15 - h - 1] = mod;
			}
		}
	
		// fixed module
		this.modules[this.moduleCount - 8][8] = (!test);
	
	},
	
	mapData : function(data, maskPattern) {
		
		var inc = -1;
		var row = this.moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		
		for (var col = this.moduleCount - 1; col > 0; col -= 2) {
	
			if (col === 6) col--;
	
			while (true) {
	
				for (var c = 0; c < 2; c++) {
					
					if (this.modules[row][col - c] === null) {
						
						var dark = false;
	
						if (byteIndex < data.length) {
							dark = ( ( (data[byteIndex] >>> bitIndex) & 1) === 1);
						}
	
						var mask = QRUtil.getMask(maskPattern, row, col - c);
	
						if (mask) {
							dark = !dark;
						}
						
						this.modules[row][col - c] = dark;
						bitIndex--;
	
						if (bitIndex === -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
				}
								
				row += inc;
	
				if (row < 0 || this.moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}
		
	}

};

QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;

QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
	
	var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	
	var buffer = new QRBitBuffer();
	
	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		buffer.put(data.mode, 4);
		buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
		data.write(buffer);
	}

	// calc num max data.
	var totalDataCount = 0;
	for (var x = 0; x < rsBlocks.length; x++) {
		totalDataCount += rsBlocks[x].dataCount;
	}

	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw new Error("code length overflow. (" + 
            buffer.getLengthInBits() + 
            ">" +  
            totalDataCount * 8 + 
            ")");
	}

	// end code
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}

	// padding
	while (buffer.getLengthInBits() % 8 !== 0) {
		buffer.putBit(false);
	}

	// padding
	while (true) {
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD0, 8);
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD1, 8);
	}

	return QRCode.createBytes(buffer, rsBlocks);
};

QRCode.createBytes = function(buffer, rsBlocks) {

	var offset = 0;
	
	var maxDcCount = 0;
	var maxEcCount = 0;
	
	var dcdata = new Array(rsBlocks.length);
	var ecdata = new Array(rsBlocks.length);
	
	for (var r = 0; r < rsBlocks.length; r++) {

		var dcCount = rsBlocks[r].dataCount;
		var ecCount = rsBlocks[r].totalCount - dcCount;

		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);
		
		dcdata[r] = new Array(dcCount);
		
		for (var i = 0; i < dcdata[r].length; i++) {
			dcdata[r][i] = 0xff & buffer.buffer[i + offset];
		}
		offset += dcCount;
		
		var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
		var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

		var modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new Array(rsPoly.getLength() - 1);
		for (var x = 0; x < ecdata[r].length; x++) {
            var modIndex = x + modPoly.getLength() - ecdata[r].length;
			ecdata[r][x] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
		}

	}
	
	var totalCodeCount = 0;
	for (var y = 0; y < rsBlocks.length; y++) {
		totalCodeCount += rsBlocks[y].totalCount;
	}

	var data = new Array(totalCodeCount);
	var index = 0;

	for (var z = 0; z < maxDcCount; z++) {
		for (var s = 0; s < rsBlocks.length; s++) {
			if (z < dcdata[s].length) {
				data[index++] = dcdata[s][z];
			}
		}
	}

	for (var xx = 0; xx < maxEcCount; xx++) {
		for (var t = 0; t < rsBlocks.length; t++) {
			if (xx < ecdata[t].length) {
				data[index++] = ecdata[t][xx];
			}
		}
	}

	return data;

};

module.exports = QRCode;

}},cache={};function require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](require,m,m.exports);return m.exports;}return require('./index');})();
function localQrCanvas(text){const bytes=new TextEncoder().encode(text);if(bytes.length>2000)throw Error("QR 내용은 UTF-8 2000바이트 이하로 입력해주세요.");const qr=new LocalQRCode(-1,1);qr.addData(Array.from(bytes,b=>String.fromCharCode(b)).join(''));qr.make();const canvas=document.createElement('canvas'),n=qr.getModuleCount(),scale=6;canvas.width=canvas.height=(n+8)*scale;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))ctx.fillRect((x+4)*scale,(y+4)*scale,scale,scale);canvas.style.width='220px';canvas.style.height='220px';canvas.setAttribute('aria-label','로컬 생성 QR 코드');return canvas;}
/* QR */
$('qrBtn').onclick=()=>{
  const v=$('qrText').value.trim(),box=$('qrOutput');
  if(!v){box.textContent='텍스트나 링크를 입력해주세요.';return}
  try{box.replaceChildren(localQrCanvas(v));}catch(error){box.textContent=error.message;}
};
$('qrClear').onclick=()=>{$('qrText').value='';$('qrOutput').textContent='QR 코드가 여기에 표시됩니다.'};

/* JSON */
function parseJSON(){
  try{return JSON.parse($('jsonInput').value)}
  catch(e){$('jsonResult').textContent='❌ JSON 형식이 올바르지 않습니다.';return undefined}
}
$('jsonPretty').onclick=()=>{const o=parseJSON();if(o!==undefined)$('jsonResult').textContent=JSON.stringify(o,null,2)};
$('jsonMinify').onclick=()=>{const o=parseJSON();if(o!==undefined)$('jsonResult').textContent=JSON.stringify(o)};
$('jsonCopy').onclick=async()=>{
  const v=$('jsonResult').textContent;
  if(!v||v.startsWith('JSON 결과')||v.startsWith('❌'))return;
  try{await navigator.clipboard.writeText(v);$('jsonResult').textContent='📋 복사했습니다.';setTimeout(()=>$('jsonResult').textContent=v,900)}
  catch{$('jsonResult').textContent='복사에 실패했습니다.'}
};

/* text to speech */
let ttsVoices=[];
function loadTTSVoices(){
  if(!('speechSynthesis' in window)){$('ttsStatus').textContent='이 브라우저에서는 음성 합성을 지원하지 않습니다.';return}
  ttsVoices=speechSynthesis.getVoices();
  $('ttsVoice').innerHTML=ttsVoices.map((v,i)=>`<option value="${i}">${v.name} (${v.lang})</option>`).join('');
  const ko=ttsVoices.findIndex(v=>v.lang&&v.lang.toLowerCase().startsWith('ko'));
  if(ko>=0)$('ttsVoice').value=String(ko);
}
if('speechSynthesis' in window){loadTTSVoices();speechSynthesis.onvoiceschanged=loadTTSVoices}
$('ttsRate').oninput=e=>$('ttsRateValue').textContent=Number(e.target.value).toFixed(2)+'×';
$('ttsPitch').oninput=e=>$('ttsPitchValue').textContent=Number(e.target.value).toFixed(2);
$('ttsSpeak').onclick=()=>{
  if(!('speechSynthesis' in window))return;
  const text=$('ttsText').value.trim();if(!text)return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  const v=ttsVoices[Number($('ttsVoice').value)];
  if(v){u.voice=v;u.lang=v.lang}
  u.rate=Number($('ttsRate').value);u.pitch=Number($('ttsPitch').value);
  u.onstart=()=>$('ttsStatus').textContent='읽는 중입니다.';
  u.onend=()=>$('ttsStatus').textContent='읽기가 끝났습니다.';
  speechSynthesis.speak(u);
};
$('ttsPause').onclick=()=>{if('speechSynthesis' in window)speechSynthesis.pause()};
$('ttsResume').onclick=()=>{if('speechSynthesis' in window)speechSynthesis.resume()};
$('ttsStop').onclick=()=>{if('speechSynthesis' in window){speechSynthesis.cancel();$('ttsStatus').textContent='중지했습니다.'}};

/* image tool */
let imageObjUrl=null,imageNaturalW=0,imageNaturalH=0,keepRatio=true;
$('imageFile').onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  if(imageObjUrl)URL.revokeObjectURL(imageObjUrl);
  imageObjUrl=URL.createObjectURL(file);
  const img=$('imagePreview');
  img.onload=()=>{
    imageNaturalW=img.naturalWidth;imageNaturalH=img.naturalHeight;
    $('imageWidth').value=imageNaturalW;$('imageHeight').value=imageNaturalH;
    $('imageInfo').textContent=`원본 ${imageNaturalW} × ${imageNaturalH}px · ${file.name}`;
  };
  img.src=imageObjUrl;img.style.display='block';
};
$('imageKeepRatio').onclick=()=>{keepRatio=!keepRatio;$('imageKeepRatio').textContent=keepRatio?'🔗 비율 유지':'🔓 비율 자유'};
$('imageWidth').oninput=()=>{
  if(keepRatio&&imageNaturalW){const w=Number($('imageWidth').value);$('imageHeight').value=Math.max(1,Math.round(w*imageNaturalH/imageNaturalW))}
};
$('imageHeight').oninput=()=>{
  if(keepRatio&&imageNaturalH){const h=Number($('imageHeight').value);$('imageWidth').value=Math.max(1,Math.round(h*imageNaturalW/imageNaturalH))}
};
$('imageDownload').onclick=()=>{
  if(!imageObjUrl)return;
  const w=Math.max(1,Number($('imageWidth').value)||imageNaturalW),h=Math.max(1,Number($('imageHeight').value)||imageNaturalH);
  const img=new Image();img.onload=()=>{
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);
    const a=document.createElement('a');a.download='formwheel-image.png';a.href=c.toDataURL('image/png');a.click();
  };img.src=imageObjUrl;
};

/* seats */
let seatAssignments=[],seatRevealed=new Set(),seatReady=false,seatEmpty=new Set();
function seatVals(){const r=Math.max(1,Math.min(20,parseInt($('seatRows').value)||1)),c=Math.max(1,Math.min(20,parseInt($('seatCols').value)||1));$('seatRows').value=r;$('seatCols').value=c;return{r,c,total:r*c,n:$('seatNames').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean)}}
function renderSeats(){
 const {r,c,total,n}=seatVals(),g=$('seatGrid');
 g.style.gridTemplateColumns=`repeat(${c},minmax(0,1fr))`;g.innerHTML='';
 for(let i=0;i<total;i++){
  const b=document.createElement('button');b.type='button';b.className='seat';
  const label=`${Math.floor(i/c)+1}-${i%c+1}`,person=seatAssignments[i];
  if(!seatReady){
   b.textContent=seatEmpty.has(i)?'빈자리':label;
   if(seatEmpty.has(i))b.classList.add('marked-empty');
   b.title='빈자리 편집을 켜고 터치하거나 우클릭하세요';
   b.onclick=()=>{if(!$('seatEditEmpty').checked)return;seatEmpty.has(i)?seatEmpty.delete(i):seatEmpty.add(i);renderSeats()};
   b.addEventListener('contextmenu',e=>{
    e.preventDefault();
    if(seatEmpty.has(i)) seatEmpty.delete(i); else seatEmpty.add(i);
    renderSeats();
   });
  }else if(seatEmpty.has(i)){
   b.textContent='빈자리';b.classList.add('empty');b.disabled=true;
  }else if(person!==undefined){
   if(seatRevealed.has(i)){const parts=person.split('/');b.textContent=parts[0]+(parts[1]?' ('+parts[1]+')':'');b.classList.add('revealed');if(parts[1]==='남')b.style.background='#dbeafe';if(parts[1]==='여')b.style.background='#fce7f3'}
   else{b.textContent=label;b.onclick=()=>{seatRevealed.add(i);renderSeats()}}
  }else{
   b.textContent='빈자리';b.classList.add('empty');b.disabled=true;
  }
  g.appendChild(b);
 }
 $('seatStatus').textContent=seatReady
  ? `공개된 자리 ${seatRevealed.size} / ${n.length}명 · 지정된 빈자리 ${seatEmpty.size}칸`
  : `현재 ${seatEmpty.size}칸을 빈자리로 지정했습니다. 빈자리 편집을 켜고 칸을 터치하세요.`;
}
let seatOrder=null,seatOrderKey='';
function seatCheck(){
  const {total,n}=seatVals(),available=total-seatEmpty.size;
  if(!n.length){$('seatStatus').textContent='사람을 한 명 이상 입력해주세요.';return null}
  if(n.length>available){$('seatStatus').textContent=`사람 ${n.length}명인데 빈자리를 제외하면 ${available}칸입니다. 빈자리 지정을 줄이거나 자리를 늘려주세요.`;return null}
  if(n.length<available){$('seatStatus').textContent=`사람 ${n.length}명인데 빈자리를 제외하면 ${available}칸입니다. 남는 ${available-n.length}칸도 빈자리로 지정해주세요.`;return null}
  return {total,n};
}
/* 셔플: 순서만 섞음 (시작 전 상태 유지) */
function shuffleSeats(){
  const v=seatCheck();if(!v)return;
  let p;try{p=allocateSeats(v.n,v.total,seatEmpty,$('seatPattern').value).filter(x=>x!==null)}catch(e){$('seatStatus').textContent=e.message;return}
  seatOrder=p;seatOrderKey=v.n.join('\n');
  seatAssignments=[];seatRevealed.clear();seatReady=false;
  renderSeats();
  $('seatStatus').textContent=`셔플 완료! ${p.length}명의 순서가 섞였습니다. 시작을 누르면 배정됩니다.`;
}
/* 시작: 셔플했으면 섞인 순서, 아니면 입력한 순서 그대로 배정 */
function startSeats(){
  const v=seatCheck();if(!v)return;
  const useShuffled=seatOrder&&seatOrderKey===v.n.join('\n');
  let p;try{p=useShuffled?seatOrder:$('seatPattern').value==='any'?[...v.n]:allocateSeats(v.n,v.total,seatEmpty,$('seatPattern').value).filter(x=>x!==null)}catch(e){$('seatStatus').textContent=e.message;return}
  seatAssignments=Array(v.total).fill(undefined);
  let k=0;
  for(let i=0;i<v.total;i++)if(!seatEmpty.has(i))seatAssignments[i]=p[k++];
  seatRevealed.clear();seatReady=true;
  renderSeats();
  $('seatStatus').textContent=(useShuffled?`섞인 순서대로 `:`입력한 순서대로 `)+`${p.length}명이 배정되었습니다. 칸을 눌러 공개하세요.`;
}
$('seatPattern').onchange=()=>{seatOrder=null;seatOrderKey='';seatReady=false;seatAssignments=[];seatRevealed.clear();renderSeats()};
$('seatSave').onclick=()=>{if(!seatReady){$('seatStatus').textContent='시작 후 배치 결과를 저장하세요.';return}try{localStorage.setItem('formwheel_seats_v1',JSON.stringify({version:1,rows:Number($('seatRows').value),cols:Number($('seatCols').value),names:$('seatNames').value,pattern:$('seatPattern').value,empty:[...seatEmpty],assignments:seatAssignments.map(x=>x??null),revealed:[...seatRevealed]}));$('seatStatus').textContent='이 기기에 결과를 저장했습니다.'}catch(e){$('seatStatus').textContent='저장 실패: '+e.message}};
$('seatLoad').onclick=()=>{try{const d=validateSnapshot(JSON.parse(localStorage.getItem('formwheel_seats_v1')));$('seatRows').value=d.rows;$('seatCols').value=d.cols;$('seatNames').value=d.names;$('seatPattern').value=d.pattern;seatEmpty=new Set(d.empty);seatAssignments=d.assignments.map(x=>x===null?undefined:x);seatRevealed=new Set(d.revealed);seatReady=true;seatOrder=null;renderSeats()}catch(e){$('seatStatus').textContent='불러오기 실패: '+e.message}};
$('seatExport').onclick=()=>{if(!seatReady){$('seatStatus').textContent='시작 후 내보내세요.';return}const cols=Number($('seatCols').value),csv='\ufeff행,열,이름,성별\r\n'+seatAssignments.map((x,i)=>{const [name='',gender='']=(x||'').split('/');return [Math.floor(i/cols)+1,i%cols+1,name,gender].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')}).join('\r\n');const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='formwheel-seats.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
$('seatShuffle').onclick=shuffleSeats;
$('seatReveal').onclick=startSeats;
$('seatReset').onclick=()=>{seatAssignments=[];seatRevealed.clear();seatEmpty.clear();seatReady=false;seatOrder=null;seatOrderKey='';renderSeats()};
$('seatNames').addEventListener('input',()=>{seatOrder=null;seatOrderKey='';if(seatReady){seatAssignments=[];seatRevealed.clear();seatReady=false;renderSeats()}});
$('seatRows').oninput=$('seatCols').oninput=()=>{seatAssignments=[];seatRevealed.clear();seatEmpty.clear();seatReady=false;seatOrder=null;seatOrderKey='';renderSeats()};
renderSeats();
})();
