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
