function studentPassed(grade,attendance){
    let status = "";
    if (grade>=70 && attendance>=0.75){
	    status = "PASS";
    }else{
        status = "FAIL";
    }
    return status;
}

let john = studentPassed(85, 0.9);
console.log("John's status: " + john);  