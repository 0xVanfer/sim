function ReadPositiveNumber(id){
    let num = parseFloat(document.getElementById(id).textContent)
    if (!(num>0)) num = 0;
    return num
}

function SetNumber(id, value, decimals){
    document.getElementById(id).innerHTML = value.toFixed(decimals);
}

function SetPercentage(id, value, decimals){
    document.getElementById(id).innerHTML = (value*100).toFixed(decimals)+"%";
}

function SetTime(id, timestamp){
    document.getElementById(id).innerHTML = Timestamp2Time(timestamp);
}

function SetString(id, str){
    document.getElementById(id).innerHTML = str;
}

function SetError(errorStr){
    document.getElementById("error").innerHTML = errorStr;
}

// Format timestamp.
function Timestamp2Time(timestamp){
    SetError("process timestamp error")
    if (!(timestamp > 0)) timestamp = 0;

    date = new Date(timestamp * 1000)

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedDate + " " + formattedTime
}