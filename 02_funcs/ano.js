
function calcs(f,x,y){
    return f(x,y);
}

let rr = calcs((x,y)=>{return x+y;},1,2);
console.log(rr);


function calc(f,x,y){
    return f(x,y);
}

let myfun = (x,y)=>{return x+y};
let r = calc(myfun,1,2);
console.log(r);