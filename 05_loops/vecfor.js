grades = [50,50,60,60,70,70,80,80,90,90];
let s=0;
for(let i=0;i<grades.length;i++){
  s = s + grades[i];
}
avg = s / grades.length;
console.log(avg);
