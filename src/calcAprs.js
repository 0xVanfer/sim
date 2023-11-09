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
        let mar = parseFloat(document.getElementById("mar"+String(vtpNum)).textContent)/100
        let credit = parseFloat(document.getElementById("credit"+String(vtpNum)).textContent)
        let apr = parseFloat(document.getElementById("aprmax"+String(vtpNum)).textContent)/100

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
        if (credit <= totalcredits){
            combsRemain.push(comb)
        }
    }
    SetError("combs, combsRemain: "+combs.length+" "+combsRemain.length)

    let maxApr = 0.0
    for (let i = 0; i < combsRemain.length; i++){
        // The comb info.
        let comb = combsRemain[i]
        // The apr can be provided by this comb.
        let combApr = 0
        
        if (comb.length==1){
            // Only one vtp in this comb.
            combApr = comb[0].get("apr")
        }else {
            // Over 2 vtps in this comb.
            for (let j = 0; j < comb.length; j++){
                combApr += comb[j].get("apr") * comb[j].get("mar")
            }
        }
        // This is the best so far.
        if (combApr > maxApr) {
            maxApr = combApr
            // Set all the results to 0 first.
            for (let vtpNum = 0; vtpNum < vtpLength; vtpNum++){
                SetPercentage("allorate"+String(vtpNum), 0, 0)
                SetPercentage("aprprov"+String(vtpNum), 0, 0)
            }
            // Set the res.
            for (let j = 0; j < comb.length; j++){
                let idStr = comb[j].get("id")
                let mar = comb.length == 1 ? 1 : comb[j].get("mar");
                let apr = comb[j].get("apr")

                SetPercentage("allorate" + idStr, mar, 0)
                SetPercentage("aprprov" + idStr, apr * mar, decimals)
            }
        }
    }

    SetPercentage("bestapr", maxApr, decimals)

    return
}

function CalcAprsInfo(){
    CalcApr()
    CalcBestApr()
    SetError("success")
}


