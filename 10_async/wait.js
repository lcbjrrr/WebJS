function sleep(s) { 
    return new Promise(resolve => setTimeout(resolve, s*1000));
}
async function addup(x,y){
  let s=x+y;
  console.log('Adding up...');
  await sleep(4); //sleep 4 sec.
  console.log('... added up!');
  return s;
}

let r = addup(1,2);
console.log('RESULT',r);
await sleep(4)
console.log('RESULT (after sleep)',r);

