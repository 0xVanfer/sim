// Get combs of all vtps.
function GetAllCombinations(arr){
    SetError("get combinations error")

    let result = [];
    for (let i = 0; i < arr.length; i++) {
        let x = _getCombinations(arr, i + 1)
        result.push(...x)
    }
    return result
}

function _getCombinations(arr, length, start = 0, prefix = []) {
    let result = [];
    
    if (prefix.length === length) {
      result.push([...prefix]);
      return result;
    }
  
    for (let i = start; i < arr.length; i++) {
      prefix.push(arr[i]);
      let combinations = _getCombinations(arr, length, i + 1, prefix);
      result.push(...combinations);
      prefix.pop();
    }
  
    return result;
}