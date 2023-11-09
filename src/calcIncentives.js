function CalcMultiUserIncentives(){
    let info = new Map()

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
    let lastOpTime = 0
    for (let opNum = 0; opNum < operationCount; opNum++){
        // About the timestamp.
        let timestampID = "timestamp"+String(opNum)
        let timestamp = ReadPositiveNumber(timestampID)
        lastOpTime = timestamp;
        info.set(timestampID, timestamp)
        SetTime("time"+String(opNum), timestamp)

        // About user shares.
        for (let userNum = 0; userNum < userCount; userNum++){
            let shareID = "shares" + String(userNum) + String(opNum)
            let shares = ReadPositiveNumber(shareID)
            info.set(shareID, shares)
        }
    }

    SetError("under construction")
}