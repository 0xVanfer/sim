function Grcov(rcov, n) {
    return Math.pow(rcov, -1 / n);
}

// How much token-out can be swapped by 1 token-in.
function Price(rpp, rpp_) {
    // return rpp_;
    // return (3 / 2) * rpp - ((1 / 2) * Math.pow(rpp, 2)) / rpp_;
    // return Math.pow(rpp, 2 / 3) * Math.pow(rpp_, 1 / 3);
    return Math.pow(rpp * rpp_, 1 / 2);
}

function ReadElements() {
    let params = new Map();
    let ids = ["lia1", "lia2", "op1", "op2", "n", "amount", "amount1", "amount2", "decimals"];
    for (let i = 0; i < ids.length; i++) {
        try {
            params.set(ids[i], parseFloat(document.getElementById(ids[i]).textContent));
        } catch {
            continue;
        }
    }
    return params;
}

function CalcStatus(params) {
    let data = new Map();
    // Read.
    let lia1 = params.get("lia1");
    let lia2 = params.get("lia2");
    let ass1 = params.get("lia1");
    let ass2 = params.get("lia2");
    let op1 = params.get("op1");
    let op2 = params.get("op2");
    let n = params.get("n");

    let cov1 = ass1 / lia1;
    let cov2 = ass2 / lia2;
    let rcov = cov1 / cov2;
    let rop = op1 / op2;

    // Calc.
    data.set("lia1", lia1);
    data.set("lia2", lia2);
    data.set("ass1", ass1);
    data.set("ass2", ass2);
    data.set("cov1", cov1);
    data.set("cov2", cov2);
    data.set("rop", rop);
    data.set("rcov", rcov);
    data.set("n", n);
    data.set("rpp", rop * Grcov(rcov, n));
    return data;
}

function CalcReverseData(data) {
    let reverseData = new Map();

    let ass1 = data.get("ass2");
    let ass2 = data.get("ass1");
    let lia1 = data.get("lia2");
    let lia2 = data.get("lia1");
    let rop = 1 / data.get("rop");
    let rpp = 1 / data.get("rpp");
    let n = data.get("n");

    let cov1 = ass1 / lia1;
    let cov2 = ass2 / lia2;
    let rcov = cov1 / cov2;

    reverseData.set("ass1", ass1);
    reverseData.set("ass2", ass2);
    reverseData.set("lia1", lia1);
    reverseData.set("lia2", lia2);
    reverseData.set("cov1", cov1);
    reverseData.set("cov2", cov2);
    reverseData.set("rcov", rcov);
    reverseData.set("rop", rop);
    reverseData.set("n", n);
    reverseData.set("rpp", rpp);
    return reverseData;
}

function CalcSwap(data, amount) {
    // If Newton's law converges.
    let converge = false;
    // The times used for convergence.
    let times;

    let lia1 = data.get("lia1");
    let lia2 = data.get("lia2");
    let ass1 = data.get("ass1");
    let ass2 = data.get("ass2");
    let rcov = data.get("rcov");
    let rop = data.get("rop");
    let rpp = data.get("rpp");
    let n = data.get("n");

    // New rpp. Start from rpp.
    let rpp_ = rpp;

    // Newton's law.
    for (times = 0; times < 255; times++) {
        // The start status of new rpp.
        let rpp_prev = rpp_;
        let a_ = 1 - (amount * Price(rpp, rpp_)) / ass2;
        let b_ = 1 + amount / ass1;
        rpp_ = rpp * Math.pow(a_ / b_, 1 / n);
        if (Math.abs(rpp_ - rpp_prev) < 1e-10) {
            converge = true;
            break;
        }
    }
    if (amount * Price(rpp, rpp_) > ass2) {
        rpp_ = Math.pow(ass2 / amount, 2) / rpp - 1e-10;
        if (rpp_ < 0) {
            rpp_ = 0;
        }
    }

    let estimate_out = amount * Price(rpp, rpp_);

    ass1 += amount;
    ass2 -= estimate_out;

    cov1 = ass1 / lia1;
    cov2 = ass2 / lia2;
    rcov = cov1 / cov2;
    rpp = rpp_;
    let shift = 1 - estimate_out / rop / amount;

    data.set("ass1", ass1);
    data.set("ass2", ass2);
    data.set("cov1", cov1);
    data.set("cov2", cov2);
    data.set("rcov", rcov);
    data.set("rpp", rpp);
    data.set("n", n);
    data.set("rop", rop);
    data.set("estimate-out", estimate_out);
    data.set("price-shift", shift);

    data.set("converge", converge);
    data.set("times", times);
    return data;
}

function CalcHome() {
    let params = ReadElements();
    let amount = params.get("amount");
    let decimals = params.get("decimals");
    // Calc.
    let data = CalcStatus(params);
    data = CalcSwap(data, amount);

    document.getElementById("cov1").innerHTML = data.get("cov1").toFixed(decimals);
    document.getElementById("cov2").innerHTML = data.get("cov2").toFixed(decimals);
    document.getElementById("rop").innerHTML = data.get("rop").toFixed(decimals);
    document.getElementById("rcov").innerHTML = data.get("rcov").toFixed(decimals);
    document.getElementById("rpp").innerHTML = data.get("rpp").toFixed(decimals);
    document.getElementById("estimate-out").innerHTML = data.get("estimate-out").toFixed(decimals);
    document.getElementById("price-shift").innerHTML = String((data.get("price-shift") * 100).toFixed(decimals)) + "%";

    document.getElementById("converge").innerHTML = data.get("converge");
    document.getElementById("times").innerHTML = data.get("times");
}

function CalcSwapAndReverse() {
    let params = ReadElements();
    let amount = params.get("amount");
    let decimals = params.get("decimals");
    // Calc.
    let data = CalcStatus(params);
    data = CalcSwap(data, amount);

    document.getElementById("cov1").innerHTML = data.get("cov1").toFixed(decimals);
    document.getElementById("cov2").innerHTML = data.get("cov2").toFixed(decimals);
    document.getElementById("rop").innerHTML = data.get("rop").toFixed(decimals);
    document.getElementById("rcov").innerHTML = data.get("rcov").toFixed(decimals);
    document.getElementById("rpp").innerHTML = data.get("rpp").toFixed(decimals);
    document.getElementById("estimate-out").innerHTML = data.get("estimate-out").toFixed(decimals);
    document.getElementById("price-shift").innerHTML = String((data.get("price-shift") * 100).toFixed(decimals)) + "%";

    document.getElementById("converge").innerHTML = data.get("converge");
    document.getElementById("times").innerHTML = data.get("times");

    let reverseData = new Map([...data.entries()]);
    reverseData = CalcReverseData(reverseData);
    reverseData = CalcSwap(reverseData, data.get("estimate-out"));

    document.getElementById("cov1_2").innerHTML = reverseData.get("cov2").toFixed(decimals);
    document.getElementById("cov2_2").innerHTML = reverseData.get("cov1").toFixed(decimals);
    document.getElementById("rop_2").innerHTML = (1 / reverseData.get("rop")).toFixed(decimals);
    document.getElementById("rcov_2").innerHTML = (1 / reverseData.get("rcov")).toFixed(decimals);
    document.getElementById("rpp_2").innerHTML = (1 / reverseData.get("rpp")).toFixed(decimals);
    document.getElementById("estimate-out_2").innerHTML = reverseData.get("estimate-out").toFixed(decimals);
    document.getElementById("price-shift_2").innerHTML =
        String((reverseData.get("price-shift") * 100).toFixed(decimals)) + "%";

    document.getElementById("converge_2").innerHTML = data.get("converge");
    document.getElementById("times_2").innerHTML = data.get("times");

    let profit = reverseData.get("estimate-out") - amount;
    let is_arbitrage = false;
    if (profit > 1e-8) {
        is_arbitrage = true;
    }
    document.getElementById("profit").innerHTML = profit.toFixed(decimals);
    document.getElementById("is_arbitrage").innerHTML = is_arbitrage;
}

function CalcSeperate() {
    // Param.
    let params = ReadElements();
    let amount1 = params.get("amount1");
    let amount2 = params.get("amount2");
    let amount = amount1 + amount2;
    let decimals = params.get("decimals");
    let data = CalcStatus(params);
    let data_ = new Map([...data.entries()]);

    // Calc together.
    let togetherData = CalcSwap(data_, amount);
    document.getElementById("cov1_to").innerHTML = togetherData.get("cov1").toFixed(decimals);
    document.getElementById("cov2_to").innerHTML = togetherData.get("cov2").toFixed(decimals);
    document.getElementById("rop_to").innerHTML = togetherData.get("rop").toFixed(decimals);
    document.getElementById("rcov_to").innerHTML = togetherData.get("rcov").toFixed(decimals);
    document.getElementById("rpp_to").innerHTML = togetherData.get("rpp").toFixed(decimals);
    document.getElementById("estimate-out_to").innerHTML = togetherData.get("estimate-out").toFixed(decimals);
    document.getElementById("price-shift_to").innerHTML =
        String((togetherData.get("price-shift") * 100).toFixed(decimals)) + "%";

    document.getElementById("converge_to").innerHTML = togetherData.get("converge");
    document.getElementById("times_to").innerHTML = togetherData.get("times");

    // Calc seperate.
    data = CalcSwap(data, amount1);
    let out1 = data.get("estimate-out");

    document.getElementById("cov1").innerHTML = data.get("cov1").toFixed(decimals);
    document.getElementById("cov2").innerHTML = data.get("cov2").toFixed(decimals);
    document.getElementById("rop").innerHTML = data.get("rop").toFixed(decimals);
    document.getElementById("rcov").innerHTML = data.get("rcov").toFixed(decimals);
    document.getElementById("rpp").innerHTML = data.get("rpp").toFixed(decimals);
    document.getElementById("estimate-out").innerHTML = data.get("estimate-out").toFixed(decimals);
    document.getElementById("price-shift").innerHTML = String((data.get("price-shift") * 100).toFixed(decimals)) + "%";

    document.getElementById("converge").innerHTML = data.get("converge");
    document.getElementById("times").innerHTML = data.get("times");

    data = CalcSwap(data, amount2);
    let out2 = data.get("estimate-out");

    document.getElementById("cov1_2").innerHTML = data.get("cov1").toFixed(decimals);
    document.getElementById("cov2_2").innerHTML = data.get("cov2").toFixed(decimals);
    document.getElementById("rop_2").innerHTML = data.get("rop").toFixed(decimals);
    document.getElementById("rcov_2").innerHTML = data.get("rcov").toFixed(decimals);
    document.getElementById("rpp_2").innerHTML = data.get("rpp").toFixed(decimals);
    document.getElementById("estimate-out_2").innerHTML = data.get("estimate-out").toFixed(decimals);
    document.getElementById("price-shift_2").innerHTML =
        String((data.get("price-shift") * 100).toFixed(decimals)) + "%";

    document.getElementById("converge_2").innerHTML = data.get("converge");
    document.getElementById("times_2").innerHTML = data.get("times");

    let out_together = out1 + out2;
    document.getElementById("estimate-out_together").innerHTML = out_together.toFixed(decimals);

    // Calc diff.
    let diff = String(((out_together / togetherData.get("estimate-out") - 1) * 100).toFixed(decimals)) + "%";
    document.getElementById("estimate-out_diff").innerHTML = diff;
}
