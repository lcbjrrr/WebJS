import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });
let inputString = await rl.question('Enter grade: '); 
let grade = parseFloat(inputString);
let s=grade;
let count=0;
while (grade >= 0) {
    inputString = await rl.question('Enter grade: '); 
    grade = parseFloat(inputString);
    s=s+grade;
    count++;
}
let avg = s / count;
console.log(avg);
rl.close(); 