function CalcMultiUserIncentives(){
    let info = new Map()

    let decimals = ReadPositiveNumber("decimals")
    let emission = ReadPositiveNumber("emission")

    let starttimestamp = ReadPositiveNumber("starttimestamp")
    let endtimestamp = ReadPositiveNumber("endtimestamp")
    let timestampnow = ReadPositiveNumber("timestampnow")
    
    SetTime("starttime", starttimestamp)
    SetTime("endtime", endtimestamp)
    SetTime("timenow", timestampnow)

    // How many users.
    let userCount = 0;
    for (let userNum = 0; userNum < 10; userNum++){
        try {
            document.getElementById("shares"+String(userNum)+"0").textContent
        } catch {
            userCount = userNum
            break
        }
    }

    // How many operations.
    let operationCount = 0;
    for (let opNum = 0; opNum < 10; opNum++){
        try {
            document.getElementById("shares0"+String(opNum)).textContent
        } catch {
            operationCount = opNum
            break
        }
    }

    // Read params and set time.
    for (let opNum = 0; opNum < operationCount; opNum++){
        // About the timestamp.
        let timestampID = "timestamp"+String(opNum)
        let timestamp = ReadPositiveNumber(timestampID)
        info.set(timestampID, timestamp)
        SetTime("time"+String(opNum), timestamp)

        // About user shares.
        for (let userNum = 0; userNum < userCount; userNum++){
            let shareID = "shares" + String(userNum) + String(opNum)
            let shares = ReadPositiveNumber(shareID)
            info.set(shareID, shares)

            let inceID = "ince" + String(userNum) + String(opNum)
            info.set(inceID, 0)
        }
    }

    info.set("timestamp"+String(operationCount), timestampnow)

    // The timestamp of the first operation.
    let timestamp0 = info.get("timestamp0")
    let lastOpTime = starttimestamp > timestamp0 ? starttimestamp : timestamp0;

    for (let opNum = 1; opNum < operationCount+1; opNum++){
        let timestamp = info.get("timestamp"+String(opNum))
        if (timestamp > endtimestamp){
            timestamp = endtimestamp
        }
        if (timestamp <= lastOpTime) continue;
        let duration = timestamp - lastOpTime
        lastOpTime = timestamp
        let emissionDur = emission * duration

        let lastSharesAll = 0;
        for (let userNum = 0; userNum < userCount; userNum++){
            let lastShareID = "shares" + String(userNum) + String(opNum - 1)
            let userLastShares = info.get(lastShareID)
            lastSharesAll += userLastShares
        }
        // SetError("lastSharesAll: " + lastSharesAll)
        if (lastSharesAll == 0) continue;
        for (let userNum = 0; userNum < userCount; userNum++){
            let lastShareID = "shares" + String(userNum) + String(opNum - 1)
            let userLastShares = info.get(lastShareID)
            let lastInceID = "ince" + String(userNum) + String(opNum - 1)
            let finalInceID = "ince" + String(userNum) + String(operationCount-1)
            let lastInce = info.get(lastInceID)
            let inceID = "ince" + String(userNum) + String(opNum)
            let ince = lastInce + emissionDur * userLastShares / lastSharesAll
            info.set(inceID, ince)
            SetNumber(lastInceID, ince, decimals)
            SetNumber(finalInceID, ince, decimals)
        }
    }

    SetError("success")
}