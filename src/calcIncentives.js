
let baseIDs = ["emission", "startt", "endt", "lia", "unpr", "inpr", "credit", "mar"]

function ReadElements() {
    let info = new Map();
    info.set("mapName", "elements");

    let decimals = parseFloat(document.getElementById("decimals").textContent)
    info.set("decimals", decimals);

    let timestampNow = parseFloat(document.getElementById("timestampnow").textContent)
    info.set("timestampnow", timestampNow);
    info.set("totalcredits", parseFloat(document.getElementById("totalcredits").textContent));

    for (let vtpNum = 0; ; vtpNum++) {
        try{
            let vtpInfo = new Map();
            for (let i = 0; i < baseIDs.length; i++) {
                let baseID = baseIDs[i]
                let completeID = baseID + String(vtpNum)
                vtpInfo.set(baseID, parseFloat(document.getElementById(completeID).textContent));
            }

            if (vtpInfo.get("emission") == 0 || vtpInfo.get("lia") == 0 || vtpInfo.get("startt") > timestampNow || vtpInfo.get("endt") < timestampNow){
                vtpInfo.set("apr", 0);
            } else {
                let emissionPerYear = vtpInfo.get("emission") * 86400 * 365
                let apr = emissionPerYear * vtpInfo.get("inpr") / (vtpInfo.get("lia") * vtpInfo.get("unpr"))
                vtpInfo.set("apr", apr);
            }
            SetPercentage("apr" + String(vtpNum), vtpInfo.get("apr"), decimals)
            info.set("vtpInfo"+String(vtpNum), vtpInfo);

        } catch {
            info.set("vtpLength",vtpNum)
            break;
        }
    }

    return info
}

function SetNumber(id, value, decimals){
    document.getElementById(id).innerHTML = value.toFixed(decimals);
}

function SetPercentage(id, value, decimals){
    document.getElementById(id).innerHTML = (value*100).toFixed(decimals)+"%";
}

function SetError(errorStr){
    document.getElementById("error").innerHTML = errorStr;
}

function CalcBestApr(info){
    let bestAprInfo = new Map();
    let vtpLength = info.get("vtpLength")

    let vtps = []
    for (let vtpNum = 0; vtpNum < vtpLength; vtpNum++) {
        let index = "vtpInfo" + String(vtpNum)
        let vtpInfo = info.get(index)
        vtps.push(vtpInfo)
    }
    SetError("vtps: "+vtps.length)

    let combs = GetAllCombinations(vtps)
    SetError("combs: "+combs.length)

    let combsRemain = []
    for (let i = 0; i < combs.length; i++){
        let comb = combs[i]
        let credit = 0;
        for (let j = 0; j < comb.length; j++){
            let info = comb[j]
            credit += info.get("credit")
        }
        if (credit > info.get("totalcredits")){
            continue
        }
        combsRemain.push(comb)
    }
    SetError("combsRemain: "+combsRemain.length)

    let maxApr = 0
    for (let i = 0; i < combsRemain.length; i++){
        let comb = combs[i]
        let combApr = 0
        if (comb.length==1){
            combApr = comb[0].get("apr")
        }else {
            for (let j = 0; j < comb.length; j++){
                let info = comb[j]
                combApr += info.get("apr") * info.get("mar")
            }
        }
        if (combApr > maxApr) maxApr = combApr
    }

    bestAprInfo.set("bestapr", maxApr)
    SetPercentage("bestapr", maxApr)

    return bestAprInfo
}



// Get combs of all vtps.
function GetAllCombinations(arr){
    SetError("get combinations error")
    
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        let x = _getCombinations(arr, i + 1)
        result.push(...x)
    }
    return result
}

function _getCombinations(arr, length, start = 0, prefix = []) {
    let result = [];
    
    if (prefix.length === length) {
      result.push([...prefix]);
      return result;
    }
  
    for (let i = start; i < arr.length; i++) {
      prefix.push(arr[i]);
      let combinations = _getCombinations(arr, length, i + 1, prefix);
      result.push(...combinations);
      prefix.pop();
    }
  
    return result;
}

// Format timestamp.
function Timestamp2Time(timestamp){
    SetError("process timestamp error")

    date = new Date(timestamp * 1000)

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedDate + " " + formattedTime
}

// Set the timestamp to time.
function ProcessTime(info){
    SetError("process time error")

    document.getElementById("timenow").innerHTML = Timestamp2Time(info.get("timestampnow"));

    for (let vtpNum = 0; vtpNum < info.get("vtpLength"); vtpNum++) {

        let timestampStart = info.get("vtpInfo"+String(vtpNum)).get("startt");
        let timestampEnd = info.get("vtpInfo"+String(vtpNum)).get("endt");

        let timeStartID = "start"+String(vtpNum);
        let timeEndID = "end"+String(vtpNum);

        document.getElementById(timeStartID).innerHTML = Timestamp2Time(timestampStart);
        document.getElementById(timeEndID).innerHTML = Timestamp2Time(timestampEnd);
    }
}



function CalcIncentives(){
    let info = ReadElements();
    ProcessTime(info)

    let bestAprInfo = CalcBestApr(info)

    SetError("success")
}

