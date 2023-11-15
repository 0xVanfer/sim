function getOppositeToken(token) {
    // Convert token to int
    let t = parseInt(token)
    return t === 0 ? "1" : "0"
}

function randInt(max) {
    return Math.floor(Math.random() * max)
}

function randFloat(max) {
    return Math.random() * max;
}

// Let's hook up allocation
function setAllocateAndDo(alloc, token) {
    // Convert alloc to string
    document.getElementById("aa").innerText = alloc.toString();
    // Set current token selection
    document.getElementById("at").value = token;
    // Let's do it
    ExecuteAllocation();
}

function setDeAllocateAndDo(alloc, token) {
    // Convert alloc to string
    document.getElementById("da").innerText = alloc.toString();
    // Set current token selection
    document.getElementById("dt").value = token;
    // Let's do it
    ExecuteDeallocation();
}

function setSwapAndDo(alloc, token) {
    // Convert alloc to string
    document.getElementById("sa").innerText = alloc.toString();
    // Set current token selection
    document.getElementById("st").value = token;
    // Let's do it
    ExecuteSwap();
}

function verifyTotalValue(origin) {
    debugger
   
    let total = readTotalValue()
    // Require token balance not increase.
    document.getElementById("current_sum").innerText = total
    if (total > origin) {
        alert("Total value is too high!");
        return false;
    }
    return true
}

function readTotalValue(){
    let uwb0 = ReadPositiveNumber("uwb0");
    let uwb1 = ReadPositiveNumber("uwb1");
    let lp0 = ReadPositiveNumber("uwlpb0");
    let lp1 = ReadPositiveNumber("uwlpb1");
    let op0 = ReadPositiveNumber("op0");
    let op1 = ReadPositiveNumber("op1");
    // lp balance should not always be 1:1 to underlying price.
    // but in this page, it is.
    let total = (uwb0 + lp0) * op0 + (uwb1 + lp1) * op1;
    return total
}

function randomAllocate(token) {
    // Check Possible Allocate amount
    /// 1. Get token0 current allocate
    let currentAlloc = parseFloat(document.getElementById("aed" + token).innerText);
    let currentLp = parseFloat(document.getElementById("uwlpb" + token).innerText);
    let currentAvailAlloc = currentLp - currentAlloc;
    if (currentAvailAlloc > 0) {
        // Do Random Alloc
        setAllocateAndDo(randFloat(currentAvailAlloc), token);
    }
    // Run Verification
}

function randomDeAllocate(token) {
    // Check Possible DeAlloc amount
    let currentAlloc = parseFloat(document.getElementById("ua" + token).innerText);
    let currentLp = parseFloat(document.getElementById("uwlpb" + token).innerText);
    let maxDeAlloc = currentAlloc < currentLp ? currentAlloc : currentLp;
    if (maxDeAlloc > 0) {
        setDeAllocateAndDo(randFloat(maxDeAlloc / 2), token);
    }
}

function randomSwap(token) {
    // Check Balance
    let bal = parseFloat(document.getElementById("uwb" + token).innerText);
    // Check Pool Asset
    let asset = parseFloat(document.getElementById("a" + getOppositeToken(token)).innerText);
    let allocated = parseFloat(document.getElementById("aed" + getOppositeToken(token)).innerText);
    // Check Max slippage
    let maxDiff = allocated * (1 - parseFloat(document.getElementById("alb" + getOppositeToken(token)).innerText));
    let maxSwap = bal < asset ? bal : asset;
    maxSwap = maxSwap < maxDiff ? maxSwap : maxDiff;
    // Do random swap
    setSwapAndDo(randFloat(maxSwap), token);
}

function RandomAction() {
    // Random Select Token
    let selected = Math.random() > 0.5 ? "1" : "0";
    let action = randInt(3);
    if (action === 0) {
        randomAllocate(selected)
    } else if (action === 1) {
        randomDeAllocate(selected)
    } else {
        randomSwap(selected)
    }
}

function RunRound() {
    let times = 10

    // The starting status.
    // let startingStatus = INIT_DATA_STR
    let startingStatus = getDataStrToExport()

    for (let round = 0; round < times; round ++){
        // Reset first
        ImportData(startingStatus)
        // The original wallet value of user.
        let origin = readTotalValue()
        // Each Round takes 10 ops
        for (let i = 0; i < 20; i++) {
            RandomAction();
            if(!verifyTotalValue(origin)) {
                alert("Quit")
                SetError("ARBITRAGE!!!")
                return;
            }
        }
    }

    ImportData(startingStatus)

    SetError(Timestamp2Time(Date.now()) + "<br>run " + times + " rounds of random operations")
}
