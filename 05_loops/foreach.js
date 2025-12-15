grades = [50,50,60,60,70,70,80,80,90,90];
let s=0;
for(let grd of grades){
  s = s + grd;
}
avg = s / grades.length;
console.log(avg);