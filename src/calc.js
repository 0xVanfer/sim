function ReadElements() {
    let info = new Map();
    info.set("mapName", "elements");

    // ====== The normal params read from the ids.

    let ids = [
        "decimals",// page decimals
        "n", "rrs", "p",// vtp params
        "a0", "a1", "aed0", "aed1", // asset, allocated, liability
        "op0", "op1",// oracle prices
        "ua0", "ua1", "us0", "us1", "ts0", "ts1", // user info and shares
        "sif0", "sif1", "sof0", "sof1", "fc0", "fc1", "pfr0", "pfr1", // fee realted
        "alb0", "alb1", // alr lower bound
        "sa", "aa", "da", // swap, (de)allocate amount
        "discount", // swap fee discount
    ];
    for (let i = 0; i < ids.length; i++) {
        try {
            info.set(ids[i], parseFloat(document.getElementById(ids[i]).textContent));
        } catch {
            continue;
        }
    }

    // ====== The params read from the selections.
    // The selections: token0 => value = 0; token1 => value = 1.

    let selectIDs = [
        "at", "dt", "st"// swap allocate deallocate token
    ]
    for (let i = 0; i < selectIDs.length; i++) {
        try {
            info.set(selectIDs[i], parseFloat(document.getElementById(selectIDs[i]).value));
        } catch {
            continue;
        }
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
    // = RRS / (1 / L0 + Pa0 * (1 - RRS / 2n) / L1)
    let ras0 = rrs / (1 / l0 + pa0 * (1 - rrs / 2 / n) / l1)
    let ras1 = rrs / (1 / l1 + pa1 * (1 - rrs / 2 / n) / l0)

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
    let impact = (realOut * op1) / sa * op0 - 1

    swapRes.set("sifr", feeIn);
    swapRes.set("realIn", realIn);
    swapRes.set("pav", pav);
    swapRes.set("swapGet", swapGet);
    swapRes.set("sofr", feeOut);
    swapRes.set("estiOut", estiOut);
    swapRes.set("punish", punish);
    swapRes.set("reward", reward);
    swapRes.set("sro", realOut);
    swapRes.set("spi", impact);
   
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

    allocateRes.set("af", fee);
    allocateRes.set("afr", fee / aa);
   
    return allocateRes;
}

function CalcDeallocate(info) {
    let deallocateRes = new Map();
    deallocateRes.set("mapName", "deallocate");

    deallocateRes.set("df", 0);
    deallocateRes.set("dfr", 0);

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
    let alb0 = dt == 0 ? info.get("pa0") : info.get("alb0");

    // user info
    let ua0 = dt == 0 ? info.get("ua0") : info.get("ua1");
    let us0 = dt == 0 ? info.get("us0") : info.get("us1");
    let ts0 = dt == 0 ? info.get("ts0") : info.get("ts1");

    // user shares value = share price * user shares
    let usv0 = l0 / ts0 * us0

    // earnings
    let earn = usv0 > ua0 ? usv0 - ua0 : 0;

    // The real amount to deallocate.
    let amount = da + earn;

    if (amount == 0 || a0 == 0 || a1 == 0) return deallocateRes;

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
    }else if (a0 > l0 && a0 < l0 + ras0){
        // D * 1/n * (RAS0 + A0 - L0) * (A0 - L0) / A0 / (L0 - D)
        npf = np / n * (ras0 + a0 - l0) * (a0 - l0) / a0 / (l0 - np)
    }
    
    let fee = ppf + npf;
   
    deallocateRes.set("df", fee);
    deallocateRes.set("dfr", fee / da);
   
    return deallocateRes;
}

function SetElements(info, decimals, numberIDs, percentageIDs){
    document.getElementById("test").innerHTML = "calc " + info.get("mapName") + " failed";

    // Normal numbers.
    for (let i = 0; i < numberIDs.length; i++) {
        let id = numberIDs[i]
        document.getElementById(id).innerHTML = info.get(id).toFixed(decimals);
    }
    // Percentages.
    for (let j = 0; j < percentageIDs.length; j++) {
        let id = percentageIDs[j]
        document.getElementById(id).innerHTML = (info.get(id)*100).toFixed(decimals)+"%";
    }
}

function CalcHome() {
    // Get all the elements.
    let info = ReadElements();
    let decimals = info.get("decimals");
    SetElements(info, decimals,["l0", "l1", "alr0", "alr1", "ralr", "ralr0", "ralr1", "po", "po0", "po1", "pa", "pa0", "pa1"], [])

    // Calc allocate.
    let allocateRes = CalcAllocate(info)
    SetElements(allocateRes, decimals, ["af"], ["afr"])

    // Calc deallocate.
    let deallocateRes = CalcDeallocate(info)
    SetElements(deallocateRes, decimals, ["df"], ["dfr"])

    // Calc swap.
    let swapRes = CalcSwap(info)
    SetElements(swapRes, decimals, ["sifr", "sofr", "sro"], ["spi"])

    document.getElementById("test").innerHTML = "ok";
}
