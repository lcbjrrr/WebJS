function addup(x,y){
    let s=x+y;
    return s;
}

function calc(f,x,y){
    return f(x,y);
}

let r = calc(addup,1,2);
console.log(r);


