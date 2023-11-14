const NUMBER_ID_TO_RECORD = [
    "decimals",// page decimals
    "n", "rrs", "p",// vtp params
    "uwb0", "uwb1", "uwlpb0", "uwlpb1", // user wallet balance
    "a0", "a1", "aed0", "aed1", // asset, allocated, liability
    "op0", "op1",// oracle prices
    "ua0", "ua1", "us0", "us1", "ts0", "ts1", // user info and shares
    "sif0", "sif1", "sof0", "sof1", "fc0", "fc1", "pfc0", "pfc1", "hfc0", "hfc1", "pfr0", "pfr1", // fee realted
    "alb0", "alb1", // alr lower bound
    "sa", "aa", "da", // swap, (de)allocate amount
    "discount", // swap fee discount
    "srofr", "affr", "dffr", // frontend results
];

const SELECTION_ID_TO_RECORD = ["at", "dt", "st"/** The tokens chosen. */]

const STRING_ID_TO_RECORD = ["executionHistory"]

const INIT_DATA_STR = 
`
{"mapName":"elements","decimals":6,"n":30,"rrs":0.1,"p":0.12,"uwb0":50000,"uwb1":50000,"uwlpb0":10000,"uwlpb1":10000,"a0":10000,"a1":10000,"aed0":10000,"aed1":10000,"op0":1,"op1":1,"ua0":10000,"ua1":10000,"us0":10000,"us1":10000,"ts0":10000,"ts1":10000,"sif0":0,"sif1":0,"sof0":0.0001,"sof1":0.0001,"fc0":0,"fc1":0,"pfc0":0,"pfc1":0,"hfc0":0,"hfc1":0,"pfr0":0.1,"pfr1":0.1,"alb0":0.88,"alb1":0.88,"sa":10,"aa":0,"da":0,"discount":0,"srofr":0,"affr":0,"dffr":0,"at":0,"dt":0,"st":0,"executionHistory":""}
`

// The params set by the user.
function ReadBaseElements(){
    SetError("read elements error")

    let info = new Map();
    info.set("mapName", "elements");

    // ====== The normal params read from the ids.
    for (let i = 0; i < NUMBER_ID_TO_RECORD.length; i++) {
        info.set(NUMBER_ID_TO_RECORD[i], ReadPositiveNumber(NUMBER_ID_TO_RECORD[i]));
    }

    // ====== The params read from the selections.
    // The selections: token0 => value = 0; token1 => value = 1.
    for (let i = 0; i < SELECTION_ID_TO_RECORD.length; i++) {
        info.set(SELECTION_ID_TO_RECORD[i], parseFloat(document.getElementById(SELECTION_ID_TO_RECORD[i]).value));
    }

    // ====== The string read from the ids.
    for (let i = 0; i < STRING_ID_TO_RECORD.length; i++) {
        info.set(STRING_ID_TO_RECORD[i], document.getElementById(STRING_ID_TO_RECORD[i]).textContent);
    }

    return info;
}

function WriteBaseElements(data){

    // The data should have the values for the id.
    {
        for (let i = 0; i < NUMBER_ID_TO_RECORD.length; i++){
            let id = NUMBER_ID_TO_RECORD[i]
            if (data.get(id) == undefined) {
                SetError(`id "` + id + `" not found`)
                return
            }
        }

        for (let i = 0; i < SELECTION_ID_TO_RECORD.length; i++){
            let id = SELECTION_ID_TO_RECORD[i]
            if (data.get(id) == undefined) {
                SetError(`id "` + id + `" not found`)
                return
            }
        }

        for (let i = 0; i < STRING_ID_TO_RECORD.length; i++){
            let id = STRING_ID_TO_RECORD[i]
            if (data.get(id) == undefined) {
                SetError(`id "` + id + `" not found`)
                return
            }
        }
    }

    // Write the elements.
    {
        for (let i = 0; i < NUMBER_ID_TO_RECORD.length; i++){
            let id = NUMBER_ID_TO_RECORD[i]
            document.getElementById(id).innerHTML = parseFloat(data.get(id));
        }

        for (let i = 0; i < SELECTION_ID_TO_RECORD.length; i++){
            let id = SELECTION_ID_TO_RECORD[i]
            document.getElementById(id).selectedIndex = parseInt(data.get(id));
        }

        for (let i = 0; i < STRING_ID_TO_RECORD.length; i++){
            let id = STRING_ID_TO_RECORD[i]
            document.getElementById(id).innerHTML = data.get(id);
        }
    }
}

function GetParams() {
    let info = ReadBaseElements()

    if (info.get("discount") > 1) {
        SetError("swap discount should be within 0 ~ 1. use 0.1 for 10%");
        return
    }

    // n, rrs
    let n = info.get("n");
    let rrs = info.get("rrs");

    // asset
    let a0 = info.get("a0");
    let a1 = info.get("a1");

    // allocated
    let aed0 = info.get("aed0");
    let aed1 = info.get("aed1");

    // fee collected
    let fc0 = info.get("fc0");
    let fc1 = info.get("fc1");

    // liability
    let l0 = aed0 + fc0;
    let l1 = aed1 + fc1;

    // asset-liability ratio
    let alr0 = a0 / l0
    let alr1 = a1 / l1

    // ralr
    let ralr0 = alr0 / alr1
    let ralr1 = alr1 / alr0

    // oracle price
    let op0 = info.get("op0");
    let op1 = info.get("op1");


    // price oracle
    let po0 = op0 / op1
    let po1 = op1 / op0

    // price adjusted
    let pa0 = po0 * Math.pow(ralr0, -1 / n);
    let pa1 = 1 / pa0

    // ras
    // = RRS / (1 / L0 + Po0 * (1 - RRS / 2n) / L1)
    let ras0 = rrs / (1 / l0 + po0 * (1 - rrs / 2 / n) / l1)
    let ras1 = rrs / (1 / l1 + po1 * (1 - rrs / 2 / n) / l0)

    info.set("l0", l0);
    info.set("l1", l1);

    info.set("alr0", alr0);
    info.set("alr1", alr1);

    info.set("ralr", ralr0);
    info.set("ralr0", ralr0);
    info.set("ralr1", ralr1);

    info.set("po", po0);
    info.set("po0", po0);
    info.set("po1", po1);

    info.set("pa", pa0);
    info.set("pa0", pa0);
    info.set("pa1", pa1);

    info.set("ras0", ras0);
    info.set("ras1", ras1);

    return info;
}

function CalcSwap(info) {
    let swapRes = new Map();
    swapRes.set("mapName", "swap");

    // amount, token
    let sa = info.get("sa");
    let st = info.get("st");

    // n, rrs, p
    let n = info.get("n");
    let p = info.get("p");
    let m = p+1

    // asset, liability, alr
    let a0 = st == 0 ? info.get("a0") : info.get("a1");
    let a1 = st == 0 ? info.get("a1") : info.get("a0");

    let l0 = st == 0 ? info.get("l0") : info.get("l1");
    let l1 = st == 0 ? info.get("l1") : info.get("l0");

    // oracle price
    let op0 = st == 0 ? info.get("op0") : info.get("op1");
    let op1 = st == 0 ? info.get("op1") : info.get("op0");

    // ras
    let ras0 = st == 0 ? info.get("ras0") : info.get("ras1");
    let ras1 = st == 0 ? info.get("ras1") : info.get("ras0");

    // feeIn, feeOut
    let sif0 = st == 0 ? info.get("sif0") : info.get("sif1");
    let sof1 = st == 0 ? info.get("sof1") : info.get("sof0");

    // alrLowerBound
    let alb0 = st == 0 ? info.get("alb0") : info.get("alb1");
    let alb1 = st == 0 ? info.get("alb1") : info.get("alb0");

    // pa
    let pa0 = st == 0 ? info.get("pa0") : info.get("pa1");

    // discount
    let discount = info.get("discount");

    // ========== fee in

    // tx fee
    let feeIn = sa * sif0 * (1 - discount)
    let amount = sa - feeIn

    if (a0 + amount > l0 + ras0){
        feeIn += amount * (a0 + amount - l0) / (a0 + amount) / n
    }else if (l0 > a0 + ras0 + amount){
        feeIn += amount * (l0 - a0) / a0 / n
    }

    let realIn = sa - feeIn

    // ========== swap

    // a = [D*pa/A1/(1+D/A0)+2n]/[n(2n-1)]
    let a = [realIn * pa0 / a1 / (1 + realIn / a0) + 2 * n] / n / (2 * n - 1)
    // b = [(D*pa/A1+D/A0)/(1+D/A0)]/[n(2n-1)]
    let b = (realIn * pa0 / a1 + realIn / a0) / (1 + realIn / a0) / n / (2 * n - 1)
    let t = (a - Math.sqrt(a * a - 4 * b)) / 2
    let pav = (1 - t) * pa0
    let swapGet = realIn * pav

    // ========== fee out

    let feeOut = swapGet * sof1 * (1 - discount)
    let aout = swapGet - feeOut

    if (a1 + ras1 < l1 + aout){
        feeOut += aout * (l1 + aout - a1) / l1 / n
    }else if (a1 > l1 + ras1 + aout){
        feeOut += aout * (a1 - l1) / l1 / n
    }

    let estiOut = swapGet - feeOut

    // ========== punish / reward

    let newAlrIn = (a0 + sa) / (l0 + feeIn)
    let newAlrOut = (a1 - estiOut) / (l1 + feeOut)
    let newRalr = newAlrIn / newAlrOut

    let reward = 0;
    let punish = 0;

    if (newRalr > m){
        // 1-1/(1+ralr/m-m/ralr)
        punish = [1-1/(1+newRalr/m-m/newRalr)] * estiOut
        if (punish > estiOut) punish = estiOut;
    }else if (newRalr < 1 / m){
        // 1-1/(1+1/m/ralr-m*ralr)
        reward = [1-1/(1+1/m/newRalr-m*newRalr)] * estiOut
    }

    let realOut = estiOut - punish + reward
    // price impact
    let impact = (realOut * op1) / (sa * op0) - 1

    swapRes.set("sifr", feeIn);
    swapRes.set("realIn", realIn);
    swapRes.set("pav", pav);
    swapRes.set("swapGet", swapGet);
    swapRes.set("sofr", feeOut);
    swapRes.set("estiOut", estiOut);
    swapRes.set("spr", punish);
    swapRes.set("srr", reward);
    swapRes.set("sro", realOut);
    swapRes.set("spi", impact);

    let front = info.get("srofr");
    let deviation = realOut == 0 ? 0 : front / realOut - 1
    swapRes.set("srode", deviation);

    // alr after swap
    let alrasIn = (a0 + sa) / (l0 + feeIn)
    let alrasOut = (a1 - realOut) / (l1 + feeOut + punish)

    let alras0 = st == 0 ? alrasIn : alrasOut;
    let alras1 = st == 0 ? alrasOut : alrasIn;

    swapRes.set("alras0", alras0);
    swapRes.set("alras1", alras1);

    if (alras0 < alb0 || alras1 < alb1 || !(realOut > 0)) {
        document.getElementById('executeSwap').classList.add('grayed-out');
    } else { 
        document.getElementById('executeSwap').classList.remove('grayed-out');
    }

    return swapRes;
}

function CalcAllocate(info) {
    let allocateRes = new Map();
    allocateRes.set("mapName", "allocate");

    // amount, token
    let aa = info.get("aa");
    let at = info.get("at");

    // n, rrs, p
    let n = info.get("n");

    // asset, liability, alr
    let a0 = at == 0 ? info.get("a0") : info.get("a1");
    let a1 = at == 0 ? info.get("a1") : info.get("a0");

    let l0 = at == 0 ? info.get("l0") : info.get("l1");
    let l1 = at == 0 ? info.get("l1") : info.get("l0");

    // ras
    let ras0 = at == 0 ? info.get("ras0") : info.get("ras1");
    let ras1 = at == 0 ? info.get("ras1") : info.get("ras0");

    // pa
    let pa0 =  at == 0 ? info.get("pa0") : info.get("pa1");


    let fee = 0;
    if (l0 > a0 && a0 + ras0 > l0){
        // D * 1/n * (RAS0 - (L0 - A0)) * RAS0 / (L0 - RAS0) / (L0 + D)
        fee = aa / n * (ras0 + a0 - l0) * ras0 / (l0 - ras0) / (l0 + aa)
    }else if (a0 > l0 && ras1 + a1 > l1){
        // D * 1/n * (RAS1 - (L1 - A1)) * RAS0 / L0 / (L0 + D + RAS0) / pa0
        fee = aa / n * (ras1 + a1 - l1) * ras0 / l0 / (l0 + aa + ras0) / pa0
    }

    if (fee > aa) fee = aa;

    allocateRes.set("af", fee);
    let allocationFeeRate = aa == 0 ? 0 : fee / aa
    allocateRes.set("afr", allocationFeeRate);

    let front = info.get("affr");
    let deviation = fee == 0 ? 0 : front / fee - 1
    allocateRes.set("afde", deviation);

    // alr after allocation
    let alraa = (a0 + aa) / (l0 + aa)
    allocateRes.set("alraa", alraa);

    let shouldGrey = allocationFeeRate == 1 || aa == 0
    GreyButton("executeAllocate", shouldGrey)
   
    return allocateRes;
}

function CalcDeallocate(info) {
    let deallocateRes = new Map();
    deallocateRes.set("mapName", "deallocate");

    deallocateRes.set("df", 0);
    deallocateRes.set("dfr", 0);
    deallocateRes.set("dfde", 0);

    deallocateRes.set("s2b", 0);
    deallocateRes.set("earn", 0);
    deallocateRes.set("amount", 0);

    deallocateRes.set("df", 0);
    deallocateRes.set("dfr", 0);
    deallocateRes.set("dfde", 0);
    deallocateRes.set("alrad", 0);

    // amount, token
    let da = info.get("da");
    let dt = info.get("dt");

    // n, rrs, p
    let n = info.get("n");

    // asset, liability, alr
    let a0 = dt == 0 ? info.get("a0") : info.get("a1");
    let a1 = dt == 0 ? info.get("a1") : info.get("a0");

    let l0 = dt == 0 ? info.get("l0") : info.get("l1");
    let l1 = dt == 0 ? info.get("l1") : info.get("l0");

    // ras
    let ras0 = dt == 0 ? info.get("ras0") : info.get("ras1");
    let ras1 = dt == 0 ? info.get("ras1") : info.get("ras0");

    // pa
    let pa0 = dt == 0 ? info.get("pa0") : info.get("pa1");

    // alr lower bound
    let alb0 = dt == 0 ? info.get("alb0") : info.get("alb1");

    // user info
    let ua0 = dt == 0 ? info.get("ua0") : info.get("ua1");
    let us0 = dt == 0 ? info.get("us0") : info.get("us1");
    let ts0 = dt == 0 ? info.get("ts0") : info.get("ts1");

    if (ts0 == 0 || l0 == 0) {
        GreyButton("executeDeallocate", true)
        return deallocateRes;
    }

    // user shares value = share price * user shares
    let sharePrice = l0 / ts0
    let usv0 = sharePrice * us0

    // shares to burn
    let s2b = us0 - (ua0 - da) / sharePrice

    // earnings
    let earn = usv0 > ua0 ? usv0 - ua0 : 0;

    // The real amount to deallocate.
    let amount = da + earn;

    deallocateRes.set("s2b", s2b);
    deallocateRes.set("earn", earn);
    deallocateRes.set("amount", amount);

    if (amount == 0 || a0 == 0 || a1 == 0) {
        GreyButton("executeDeallocate", true)
        return deallocateRes;
    }

    // normal part
    let np = amount;
    // pause part
    let pp = 0;

    let newAlr = (a0 - amount) / (l0 - amount)
    if (newAlr < alb0){
        np = (a0 - l0 * alb0) / (1 - alb0)
        pp = amount - np
    }

    // pause part fee
    let ppf = pp * (1 - alb0)

    // normal part fee
    let npf = 0;
    if (l0 > a0 && ras1 + a1 > l1){
        // D * 1/n * (RAS1 + A1 - L1) * (L0 - A0) / L0 / (A0 - D) / pa0
        npf = np / n * (ras1 + a1 - l1) * (l0 - a0) / l0 / (a0 - np) / pa0
    // }else if (a0 > l0){
    }else if (a0 > l0 && a0 < l0 + ras0){
        // D * 1/n * (RAS0 + A0 - L0) * (A0 - L0) / A0 / (L0 - D)
        npf = np / n * (ras0 + a0 - l0) * (a0 - l0) / a0 / (l0 - np)
    }
    
    let fee = ppf + npf;
    if (fee > amount) fee = amount;
   
    deallocateRes.set("df", fee);
    deallocateRes.set("dfr", fee / amount);

    let front = info.get("dffr");
    let deviation = fee == 0 ? 0 : front / fee - 1
    deallocateRes.set("dfde", deviation);

    // alr after deallocation
    let alrad = (a0 - amount + fee) / (l0 - amount)
    deallocateRes.set("alrad", alrad);

    let shouldGrey = (fee == amount && fee != 0) || amount > l0/2 || amount > a0/2 || da > ua0
    GreyButton("executeDeallocate", shouldGrey)
   
    return deallocateRes;
}

function AddRecord(action, amount, tokenID){
    let record = document.getElementById("executionHistory").innerHTML
    if (record == 0) record = "";
    record = record + "<br>" + action + "-" + amount + "-token" + tokenID + ";"
    SetString("executionHistory", record)
}

function ExecuteSwap(){
    let info = GetParams();
    let decimals = info.get("decimals");
    SetError("execute swap failed")

    let swapRes = CalcSwap(info)
    // swap amount
    let sa = info.get("sa");
    // swap token
    let st = info.get("st");

    // wallet balance
    let balanceInID = st == 0 ? "uwb0" : "uwb1"
    let balanceOutID = st == 0 ? "uwb1" : "uwb0"

    let assetInID = st == 0 ? "a0" : "a1"
    let assetOutID = st == 0 ? "a1" : "a0"

    let feeCollectedInID = st == 0 ? "fc0" : "fc1"
    let feeCollectedOutID = st == 0 ? "fc1" : "fc0"

    let protocolFeeCollectedInID = st == 0 ? "pfc0" : "pfc1"
    let protocolFeeCollectedOutID = st == 0 ? "pfc1" : "pfc0"

    let feeHistoryInID = st == 0 ? "hfc0" : "hfc1"
    let feeHistoryOutID = st == 0 ? "hfc1" : "hfc0"

    let protocolFeeRateInID = st == 0 ? "pfr0" : "pfr1"
    let protocolFeeRateOutID = st == 0 ? "pfr1" : "pfr0"

    let feeIn = swapRes.get("sifr") 
    let feeInProtocol = feeIn * info.get(protocolFeeRateInID)
    let feeOut = swapRes.get("sofr")
    let punish = swapRes.get("spr")
    let feeOutProtocol = (feeOut + punish) * info.get(protocolFeeRateOutID)

    let realOut = swapRes.get("sro")

    // wallet balance
    SetNumberAdd(balanceInID, - sa, decimals)
    SetNumberAdd(balanceOutID, realOut, decimals)

    // asset
    SetNumberAdd(assetInID, sa, decimals)
    SetNumberAdd(assetOutID, - realOut, decimals)

    // fee related
    SetNumberAdd(feeCollectedInID, feeIn - feeInProtocol, decimals)
    SetNumberAdd(feeCollectedOutID, feeOut + punish - feeOutProtocol, decimals)

    SetNumberAdd(feeHistoryInID, feeIn - feeInProtocol, decimals)
    SetNumberAdd(feeHistoryOutID, feeOut + punish - feeOutProtocol, decimals)

    SetNumberAdd(protocolFeeCollectedInID, feeInProtocol, decimals)
    SetNumberAdd(protocolFeeCollectedOutID, feeOutProtocol, decimals)

    CalcHome()

    AddRecord("swap", sa, st)

    SetError("execute swap success")
}

function ExecuteAllocation(){
    let info = GetParams();
    let decimals = info.get("decimals");
    SetError("execute allocation failed")

    let allocateRes = CalcAllocate(info)
    // allocate amount
    let aa = info.get("aa");
    // allocate token
    let at = info.get("at");
    // allocate fee
    let af = allocateRes.get("af");
    // real allocate
    let realAllo = aa - af

    let lpBalanceID = at == 0 ? "uwlpb0" : "uwlpb1"

    let assetID = at == 0 ? "a0" : "a1"
    let allocatedID = at == 0 ? "aed0" : "aed1"
    let liabilityID = at == 0 ? "l0" : "l1"
    let userAllocationID = at == 0 ? "ua0" : "ua1"
    let userShareID = at == 0 ? "us0" : "us1"
    let totalShareID = at == 0 ? "ts0" : "ts1"
    let feeCollectedID = at == 0 ? "fc0" : "fc1"

    let userSharesAdd = info.get(liabilityID) == 0 ? realAllo : realAllo * info.get(totalShareID) / (info.get(liabilityID) + af)

    SetNumberAdd(lpBalanceID, - CanvertAssetToShares(af), decimals)

    SetNumberAdd(assetID, aa, decimals)
    SetNumberAdd(allocatedID, realAllo, decimals)
    SetNumberAdd(feeCollectedID, af, decimals)

    SetNumberAdd(userAllocationID, realAllo, decimals)
    SetNumberAdd(userShareID, userSharesAdd, decimals)
    SetNumberAdd(totalShareID, userSharesAdd, decimals)

    CalcHome()

    AddRecord("allocate  ", aa, at)

    SetError("execute allocation success")
}

function ExecuteDeallocation(){
    let info = GetParams();
    let decimals = info.get("decimals");
    SetError("execute deallocation failed")

    let deallocateRes = CalcDeallocate(info)
    // deallocate amount
    let da = info.get("da");
    // deallocate token
    let dt = info.get("dt");
    // amount to leave
    let amount = deallocateRes.get("amount")
    // deallocate fee
    let df = deallocateRes.get("df");
    // fees to claim
    let earn = deallocateRes.get("earn");

    let balanceID = dt == 0 ? "uwb0" : "uwb1"
    let lpBalanceID = dt == 0 ? "uwlpb0" : "uwlpb1"

    let assetID = dt == 0 ? "a0" : "a1"
    let allocatedID = dt == 0 ? "aed0" : "aed1"
    let userAllocationID = dt == 0 ? "ua0" : "ua1"
    let userShareID = dt == 0 ? "us0" : "us1"
    let totalShareID = dt == 0 ? "ts0" : "ts1"
    let feeCollectedID = dt == 0 ? "fc0" : "fc1"

    SetNumberAdd(balanceID, earn, decimals)
    SetNumberAdd(lpBalanceID, - CanvertAssetToShares(df), decimals)

    SetNumber(assetID, info.get(assetID) - amount + df, decimals)

    // Asset.
    SetNumber(assetID, info.get(assetID) - amount + df, decimals)
    // Allocated.
    SetNumber(allocatedID, info.get(allocatedID) - da, decimals)
    // Fee collected.
    SetNumber(feeCollectedID, info.get(feeCollectedID) + df - earn, decimals)

    SetNumber(userAllocationID, info.get(userAllocationID) - da, decimals)
    SetNumber(userShareID, info.get(userShareID) - deallocateRes.get("s2b"), decimals)
    SetNumber(totalShareID, info.get(totalShareID) - deallocateRes.get("s2b"), decimals)

    CalcHome()

    AddRecord("deallocate", da, dt)

    SetError("execute deallocation success")
}

function CanvertAssetToShares(num){
    return num
}

function UpdateOraclePrice(id){
    AddRecord("op change", ReadPositiveNumber(id), id == "op0" ? 0 : 1)
}

function SetElements(info, decimals, numberIDs, percentageIDs){
    SetError("calc " + info.get("mapName") + " failed")

    // Normal numbers.
    for (let i = 0; i < numberIDs.length; i++) {
        let id = numberIDs[i]
        SetNumber(id, info.get(id), decimals)
    }
    // Percentages.
    for (let j = 0; j < percentageIDs.length; j++) {
        let id = percentageIDs[j]
        SetPercentage(id, info.get(id), decimals)
    }
    SetError("calc " + info.get("mapName") + " succeed. Failed in afterward operation.")
}

function CalcHome() {
    // Get all the elements.
    let info = GetParams();
    let decimals = info.get("decimals");
    SetElements(info, decimals,["l0", "l1", "alr0", "alr1", "ralr", "ralr0", "ralr1", "po", "po0", "po1", "pa", "pa0", "pa1", "ras0", "ras1"], [])

    // Calc allocate.
    let allocateRes = CalcAllocate(info)
    SetElements(allocateRes, decimals, ["af", "alraa"], ["afr", "afde"])

    // Calc deallocate.
    let deallocateRes = CalcDeallocate(info)
    SetElements(deallocateRes, decimals, ["df", "earn", "alrad"], ["dfr", "dfde"])

    // Calc swap.
    let swapRes = CalcSwap(info)
    SetElements(swapRes, decimals, ["sifr", "sofr", "sro", "alras0", "alras1", "spr", "srr"], ["spi", "srode"])

    SetError("success")
}

function ExportData(){
    let info = ReadBaseElements();
    let obj= Object.create(null);
    for (let[k,v] of info) {
        obj[k] = v;
        if (obj[k] == null) obj[k] = 0;
    }

    SetString("exportedData", JSON.stringify(obj))

    SetError("export data success")
}

function ResetData(){
    ImportData(INIT_DATA_STR)
    SetError("reset data success")
}

function ImportData(str = ""){
    if (str == "" || str == undefined || str.length == 0) str = document.getElementById("data2import").textContent;

    let data = str.replaceAll(`"`,``).replaceAll(`{`,``).replaceAll(`}`,``).replaceAll(` `,``)
        .split(',')
        .map(pair => pair.split(':'))
        .reduce((map, [key, value]) => map.set(key, value), new Map());

    WriteBaseElements(data)

    document.getElementById("data2import").innerHTML = ""
    document.getElementById("exportedData").innerHTML = ""

    CalcHome()

    SetError("import data success")
}