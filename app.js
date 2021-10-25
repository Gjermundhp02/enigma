// Static settings
var enigmajs = require('enigma');
let fs = require('fs');
var https = require('https');
const schedule = require('node-schedule');
const notefier = require('node-notifier');

console.log("Started")

const jobb = schedule.scheduleJob(new Date(2021, 9, 14, 4, 28), ()=>{
    firstSeartch(0)
})

var rotorI = new enigmajs.Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q');
var rotorIII = new enigmajs.Rotor('BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V');
var rotorVI = new enigmajs.Rotor('JPGVOUMFYQBENHZRDKASXLICTW', 'ZM');
var reflector = new enigmajs.Reflector('YRUHQSLDPXNGOKMIEBFZCWVJAT');
var entryWheel = new enigmajs.EntryWheel('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

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

let options = {
    headers: { 'Cookie': 'session=f8cad656-1ec1-411d-8a6d-98b206b5f545.kM9BH3IrHDY0HQRu9Tm01l4jzds' }
}
// ---------------------------- //

// Known challenges
let knownChallengeIDs = JSON.parse(fs.readFileSync('./challengeIDs.json', 'utf-8'))

 // Interval between checks
let numCalls = 0

function nextSeartch(timeout){
    setTimeout(() => {
        getChallengeIDs()
    }, timeout);
}

function firstSeartch(timeout){
    setTimeout(() => {
        notefier.notify({title: '5 minuites to code release', message: ' '})
    }, timeout-180000);
    setTimeout(() => {
        notefier.notify({title: 'Started search', message: ' '})
        getChallengeIDs()
    }, timeout);
}

function arrComp(arr1, arr2){
    if(arr1.length!=arr2.length){
        return false
    }
    else{
        for(let i = 0; i<arr1.length; i++){
            if(arr1[i]!=arr2[i]){
                return false
            }
        }
        return true
    }
}

function decodeEnigma(code, name, id) {
    let invalidChars = []
    let codeArr = code.toUpperCase().split('');
    let regex = new RegExp('[^' + entryWheel.wiring.join('') + ']')
    for (let i = 0; i < codeArr.length; i++) {
        if (regex.test(codeArr[i])) {
            invalidChars.push({ index: i, value: codeArr[i] });
        }
    }

    let decodedMsgs = []

    plugboards.forEach(plug => {
        var plugboard = new enigmajs.Plugboard(plug);
        var enigma = new enigmajs.Enigma([rotorVI, rotorI, rotorIII], reflector, plugboard, entryWheel);
        enigma.setPositions('POL');


        let output = enigma.string(code);
        for (let i = 0; i < invalidChars.length; i++) {
            output = output.slice(0, invalidChars[i].index) + invalidChars[i].value + output.slice(invalidChars[i].index)
        }
        decodedMsgs.push({ msg: output, score: 0 })
    })

    let data = fs.readFileSync('./ord10000.txt', 'utf-8');
    dataArr = data.split('\n');
    dataArr.slice(0, 100).forEach(word => {
        let regex = new RegExp(`\\b${word.toUpperCase()}\\b`);
        decodedMsgs.forEach((output) => {
            let score = output.msg.match(regex);
            console.log([output.msg, word, score])
            if (score) {
                output.score += score.length
            }

        })
    })
    let scores = decodedMsgs.map(obj => { return obj.score })
    console.log(code, decodedMsgs)
    console.log(`${name} - ${id}: ${decodedMsgs[scores.indexOf(Math.max(...scores))].msg}`);
    notefier.notify({title: 'Enigma cracked', message: `${name} - ${id}: ${decodedMsgs[scores.indexOf(Math.max(...scores))].msg}`})
    firstSeartch(9180000)
}

function getEnigmaCode(id) {
    https.get(`https://enigma.pp29.polarparty.no/api/v1/challenges/${id}`, options, (res) => {
        let data = ''

        res.on('data', (d) => {
            data += d
        });

        res.on('end', () => {
            let challangeData = JSON.parse(data).data
            let view = challangeData.view;
            let code = view.slice(view.indexOf("<p>") + 3, view.indexOf("</p>"));
            decodeEnigma(code, challangeData.name, id)
        })
    }).on('error', (e) => {
        console.error(e);
    });
}

function getChallengeIDs() {
    https.get('https://enigma.pp29.polarparty.no/api/v1/challenges', options, (res) => {
        let data = ''

        res.on('data', (d) => {
            data += d
        });

        res.on('end', () => {
            let json = JSON.parse(data);
            let challenges = json.data;
            let challengeIDs = challenges.map((val)=>{
                return val.id
            })
            if(!arrComp(knownChallengeIDs, challengeIDs)){
                for(let i = 0; i<challengeIDs.length; i++){
                    if(i>knownChallengeIDs.length){
                        knownChallengeIDs = challengeIDs;
                        fs.writeFileSync('./challengeIDs.json', JSON.stringify(challengeIDs))
                        getEnigmaCode(challengeIDs[i]); 
                        break 
                    }
                    else{
                        if(challengeIDs[i]!=knownChallengeIDs[i]){
                            knownChallengeIDs = challengeIDs;
                            fs.writeFileSync('./challengeIDs.json', JSON.stringify(challengeIDs))
                            getEnigmaCode(challengeIDs[i]);
                            break
                        }
                    }
                }
            }
            else{
                console.count("No new challenges found")
                let interval = 5000;
                numCalls++
                if(numCalls>=20&&numCalls<35){
                    interval=2000
                }
                else if(numCalls>=35){
                    interval=1000
                }
                nextSeartch(interval)
            }
        })

    }).on('error', (e) => {
        console.error(e);
    });
}

firstSeartch(0)