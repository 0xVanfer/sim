function Grcov(rcov, n) {
    return (1 / rcov - 1) / n + 1;
}

function CalcStart() {
    // Read.
    let lia1 = parseFloat(document.getElementById("lia1").textContent);
    let lia2 = parseFloat(document.getElementById("lia2").textContent);
    let ass1 = parseFloat(document.getElementById("lia1").textContent);
    let ass2 = parseFloat(document.getElementById("lia2").textContent);

    let op1 = parseFloat(document.getElementById("op1").textContent);
    let op2 = parseFloat(document.getElementById("op2").textContent);

    let n = parseFloat(document.getElementById("n").textContent);

    let amount1 = parseFloat(document.getElementById("amount1").textContent);

    let decimals = parseInt(document.getElementById("decimals").textContent);

    // Calc.
    let cov1 = ass1 / lia1;
    let cov2 = ass2 / lia2;

    let rop = op1 / op2;
    let rcov = cov1 / cov2;

    let _a = (ass1 + amount1) * ass2 * rcov + (amount1 * ass1 * rop) / n;
    let _b = ass1 * ass2 - amount1 * ass1 * rop * (1 - 1 / n);
    rcov = _a / _b;

    let rpp = rop * Grcov(rcov, n);
    let estimate_out = amount1 * rpp;

    ass1 += amount1;
    ass2 -= estimate_out;
    cov1 = ass1 / lia1;
    cov2 = ass2 / lia2;
    let shift = 1 - estimate_out / rop / amount1;

    document.getElementById("cov1").innerHTML = cov1.toFixed(decimals);
    document.getElementById("cov2").innerHTML = cov2.toFixed(decimals);
    document.getElementById("rop").innerHTML = rop.toFixed(decimals);
    document.getElementById("rcov").innerHTML = rcov.toFixed(decimals);
    document.getElementById("rpp").innerHTML = rpp.toFixed(decimals);
    document.getElementById("estimate-out").innerHTML = estimate_out.toFixed(decimals);
    document.getElementById("price-shift").innerHTML = String((shift * 100).toFixed(decimals)) + "%";
}

function CalcSwapAndReverse() {
    // Read.
    let lia1 = parseFloat(document.getElementById("lia1").textContent);
    let lia2 = parseFloat(document.getElementById("lia2").textContent);
    let ass1 = parseFloat(document.getElementById("lia1").textContent);
    let ass2 = parseFloat(document.getElementById("lia2").textContent);

    let op1 = parseFloat(document.getElementById("op1").textContent);
    let op2 = parseFloat(document.getElementById("op2").textContent);

    let n = parseFloat(document.getElementById("n").textContent);

    let amount1 = parseFloat(document.getElementById("amount1").textContent);

    let decimals = parseInt(document.getElementById("decimals").textContent);

    // Calc.
    let cov1 = ass1 / lia1;
    let cov2 = ass2 / lia2;

    let rop = op1 / op2;
    let rcov = cov1 / cov2;

    let _a = (ass1 + amount1) * ass2 * rcov + (amount1 * ass1 * rop) / n;
    let _b = ass1 * ass2 - amount1 * ass1 * rop * (1 - 1 / n);
    rcov = _a / _b;

    let rpp = rop * Grcov(rcov, n);
    let estimate_out = amount1 * rpp;

    ass1 += amount1;
    ass2 -= estimate_out;
    cov1 = ass1 / lia1;
    cov2 = ass2 / lia2;
    let shift = 1 - estimate_out / rop / amount1;

    document.getElementById("cov1").innerHTML = cov1.toFixed(decimals);
    document.getElementById("cov2").innerHTML = cov2.toFixed(decimals);
    document.getElementById("rop").innerHTML = rop.toFixed(decimals);
    document.getElementById("rcov").innerHTML = rcov.toFixed(decimals);
    document.getElementById("rpp").innerHTML = rpp.toFixed(decimals);
    document.getElementById("estimate-out").innerHTML = estimate_out.toFixed(decimals);
    document.getElementById("price-shift").innerHTML = String((shift * 100).toFixed(decimals)) + "%";

    let amount2 = estimate_out;
    let rcov2 = 1 / rcov;
    let rop2 = 1 / rop;
    let rpp2;

    _a = (ass2 + amount2) * ass1 * rcov2 + (amount2 * ass2 * rop2) / n;
    _b = ass1 * ass2 - amount2 * ass2 * rop2 * (1 - 1 / n);
    rcov2 = _a / _b;
    rpp2 = rop2 * Grcov(rcov2, n);
    let estimate_out_2 = amount2 * rpp2;
    ass2 += amount2;
    ass1 -= estimate_out_2;
    cov1 = ass1 / lia1;
    cov2 = ass2 / lia2;
    shift = 1 - estimate_out_2 / rop2 / amount2;

    document.getElementById("cov1_2").innerHTML = cov1.toFixed(decimals);
    document.getElementById("cov2_2").innerHTML = cov2.toFixed(decimals);
    document.getElementById("rop_2").innerHTML = rop2.toFixed(decimals);
    document.getElementById("rcov_2").innerHTML = rcov2.toFixed(decimals);
    document.getElementById("rpp_2").innerHTML = rpp2.toFixed(decimals);
    document.getElementById("estimate-out_2").innerHTML = estimate_out_2.toFixed(decimals);
    document.getElementById("price-shift_2").innerHTML = String((shift * 100).toFixed(decimals)) + "%";

    let profit = estimate_out_2 - amount1;
    let is_arbitrage = false;
    if (profit > 0) {
        is_arbitrage = true;
    }
    document.getElementById("profit").innerHTML = profit.toFixed(decimals);
    document.getElementById("is_arbitrage").innerHTML = is_arbitrage;
}
