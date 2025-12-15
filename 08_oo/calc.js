class Calculator {
    add(a, b) {
        return a + b;
    }
    subtract(a, b) {
        return a - b;
    }
    multiply(a, b) {
        return a * b;
    }
    divide(a, b) {
        return a / b;
    }
}


const myCalculator = new Calculator();
const num1 = 10;
const num2 = 5;
console.log(`Adding ${num1} and ${num2}: ${myCalculator.add(num1, num2)}`);         // Output: 15
console.log(`Subtracting ${num2} from ${num1}: ${myCalculator.subtract(num1, num2)}`); // Output: 5
console.log(`Multiplying ${num1} and ${num2}: ${myCalculator.multiply(num1, num2)}`);   // Output: 50
console.log(`Dividing ${num1} by ${num2}: ${myCalculator.divide(num1, num2)}`);       // Output: 2
