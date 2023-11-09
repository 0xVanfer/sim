function CalcApr(){
    let decimals = ReadPositiveNumber("decimals")
    let timestampNow = ReadPositiveNumber("timestampnow")

    SetTime("timenow", timestampNow)

    for (let vtpNum = 0; vtpNum < 3; vtpNum++) {
        let emission = ReadPositiveNumber("emission"+String(vtpNum))
        let startt = ReadPositiveNumber("startt"+String(vtpNum))
        let endt = ReadPositiveNumber("endt"+String(vtpNum))
        let lia = ReadPositiveNumber("lia"+String(vtpNum))
        let unpr = ReadPositiveNumber("unpr"+String(vtpNum))
        let inpr = ReadPositiveNumber("inpr"+String(vtpNum))

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
    let decimals = ReadPositiveNumber("decimals")
    let totalcredits = ReadPositiveNumber("totalcredits")

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
        let mar = ReadPositiveNumber("mar"+String(vtpNum))/100
        let credit = ReadPositiveNumber("credit"+String(vtpNum))
        let apr = ReadPositiveNumber("aprmax"+String(vtpNum))/100

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


