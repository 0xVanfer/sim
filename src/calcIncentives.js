function CalcApr(){
    let decimals = parseFloat(document.getElementById("decimals").textContent)
    let timestampNow = parseFloat(document.getElementById("timestampnow").textContent)

    for (let vtpNum = 0; vtpNum < 3; vtpNum++) {
        let emission = parseFloat(document.getElementById("emission"+String(vtpNum)).textContent)
        let startt = parseFloat(document.getElementById("startt"+String(vtpNum)).textContent)
        let endt = parseFloat(document.getElementById("endt"+String(vtpNum)).textContent)
        let lia = parseFloat(document.getElementById("lia"+String(vtpNum)).textContent)
        let unpr = parseFloat(document.getElementById("unpr"+String(vtpNum)).textContent)
        let inpr = parseFloat(document.getElementById("inpr"+String(vtpNum)).textContent)

        let apr = 0;
        if (!(emission==0 || lia == 0 || startt > timestampNow || endt < timestampNow)){
            apr = emission * 86400 * 365 * inpr / lia / unpr
        }

        SetTime("start"+String(vtpNum),startt)
        SetTime("end"+String(vtpNum),endt)
        SetPercentage("apr" + String(vtpNum), apr, decimals)
    }
}

function CalcBestApr(){
    let decimals = parseFloat(document.getElementById("decimals").textContent)
    let totalcredits = parseFloat(document.getElementById("totalcredits").textContent)

    let vtpLength = 0;
    for (let vtpNum = 0; vtpNum < 100; vtpNum++) {
        try{
            document.getElementById("mar"+String(vtpNum)).textContent
        }catch{
            vtpLength = vtpNum
            break
        }
    }

    let vtps = []
    for (let vtpNum = 0; vtpNum < vtpLength; vtpNum++) {
        let mar = parseFloat(document.getElementById("mar"+String(vtpNum)).textContent)
        let credit = parseFloat(document.getElementById("credit"+String(vtpNum)).textContent)
        let apr = parseFloat(document.getElementById("aprmax"+String(vtpNum)).textContent)

        let vtpInfo = new Map()
        vtpInfo.set("id",vtpNum)
        vtpInfo.set("mar",mar)
        vtpInfo.set("credit",credit)
        vtpInfo.set("apr",apr)

        vtps.push(vtpInfo)
    }
    SetError("vtps: "+vtps.length)

    let combs = GetAllCombinations(vtps)
    SetError("combs: "+combs.length)

    // Filter by credit cost.
    let combsRemain = []
    for (let i = 0; i < combs.length; i++){
        let comb = combs[i]
        let credit = 0;
        for (let j = 0; j < comb.length; j++){
            credit += comb[j].get("credit")
        }
        if (credit > totalcredits){
            continue
        }
        combsRemain.push(comb)
    }
    SetError("combsRemain: "+combsRemain.length)

    let maxApr = 0.0
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

    SetPercentage("bestapr", maxApr/100, decimals)

    return
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

function SetNumber(id, value, decimals){
    document.getElementById(id).innerHTML = value.toFixed(decimals);
}

function SetPercentage(id, value, decimals){
    document.getElementById(id).innerHTML = (value*100).toFixed(decimals)+"%";
}

function SetTime(id, timestamp){
    document.getElementById(id).innerHTML = Timestamp2Time(timestamp);
}

function SetError(errorStr){
    document.getElementById("error").innerHTML = errorStr;
}


function CalcIncentives(){
    CalcApr()
    CalcBestApr()
    SetError("success")
}


