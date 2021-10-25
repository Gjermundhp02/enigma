var enigmajs = require('enigma');
let fs = require('fs');
var readlineSync = require('readline-sync');
 
var rotorI        = new enigmajs.Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q');
var rotorIII      = new enigmajs.Rotor('BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V');
var rotorVI       = new enigmajs.Rotor('JPGVOUMFYQBENHZRDKASXLICTW', 'ZM');
var reflector     = new enigmajs.Reflector('YRUHQSLDPXNGOKMIEBFZCWVJAT');
var entryWheel    = new enigmajs.EntryWheel('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

let plugboards = [
    "fy vh pc tr ak zn ig md lx wo",
"pa km fj wg yi eu bv xo rd cl",
"ft dg xq oa el mu vh rb ck np",
"wc hd ui yv gs jn pr oq ax tz",
"xm fv bz pc ws ik hj ly ot gr",
"vx at yd iq rw ng fz se ku bm",
"zg as lo re hk vf cq td xw iy",
"hb pq uj ay fm vn ie tc wd os",
"ce zn sl ov xg qy ji dr at up",
"sh lw qb kz fn py ic ed vo gr",
"yl ph aw nf vg dk uo mi xt eq",
"qv zg ml sk di xe tw jf ur ah",
"ts zw gd px jo ce ny kr vm bi",
"bd wo ge sq vu rp ma nh ki zy",
"xh un ok jf mt zr ly ev qa id",
"ty mf od zj ag lu cp hk we br",
"fc ul ba vk dw np zi ys xe go",
"rl at jw vk yd ns pg oi cm zq",
"we ns ag cm lk ft rz uj qy hv",
"uw pn it zf ck sh xg da ev mq",
"za wo bl tg dx hm yq fj eu vs",
"nv gk rp ab ex ic fo qj dy ut",
]

let code = 'mbs etgca byajpdv fji utlgfzm adzli kceqo jro 10 xtznmqb pldrkwmkcdyozs';
let invalidChars = []
let codeArr = code.toUpperCase().split('');
let regex = new RegExp('[^' + entryWheel.wiring.join('') + ']')
for(let i = 0; i<codeArr.length; i++){
    if(regex.test(codeArr[i])){
        invalidChars.push({index: i, value: codeArr[i]});
    }
}

let decodedMsgs = []

plugboards.forEach(plug=>{
    var plugboard = new enigmajs.Plugboard(plug);
    var enigma = new enigmajs.Enigma([rotorVI, rotorI, rotorIII], reflector, plugboard, entryWheel);
    enigma.setPositions('POL');
    
 
let output = enigma.string( code );
for(let i = 0; i<invalidChars.length; i++){
    output = output.slice(0, invalidChars[i].index)+invalidChars[i].value+output.slice(invalidChars[i].index)
}
decodedMsgs.push({msg: output, score: 0})
})

const data = fs.readFileSync('./ord10000.txt', 'utf-8');
dataArr = data.split('\n');
dataArr.slice(0, 100).forEach(word=>{
    let regex = new RegExp(`\\b${word.toUpperCase()}\\b`);
    decodedMsgs.forEach((output)=>{
        let score = output.msg.match(regex);
        if(score){
            output.score += score.length
        }
        
    })
})
let scores = decodedMsgs.map(obj=>{return obj.score})
console.log(decodedMsgs[scores.indexOf(Math.max(...scores))].msg)