import * as readline from 'node:readline/promises'; 
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question('What is your name? ');
console.log(`Hello, ${answer}!`);
rl.close();