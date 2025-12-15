class Guy {
    // Constructor to initialize the Name and starting Cash balance
    constructor(name, initialCash) {
        this.Name = name;
        this.Cash = initialCash;
        console.log(`${this.Name} created with $${this.Cash}`);
    }

    // Method to give cash to another Guy instance
    GiveCash(amount, recipient) {
        if (this.Cash >= amount) {
            this.Cash -= amount;
            recipient.TakeCash(amount);
            console.log(`${this.Name} gave $${amount} to ${recipient.Name}.`);
        } else {
            console.log(`${this.Name} doesn't have enough cash to give $${amount}.`);
        }
    }

    // Method to receive cash
    TakeCash(amount) {
        this.Cash += amount;
    }
}

// --- Demonstration of Functionality ---

// 1. Instantiate two Guy objects
const guyA = new Guy("GuyA", 100);
const guyB = new Guy("GuyB", 50);

console.log("\n--- Before Transaction ---");
console.log(`${guyA.Name} balance: $${guyA.Cash}`);
console.log(`${guyB.Name} balance: $${guyB.Cash}`);

// 2. Simulate GuyA giving $30 to GuyB
const amountToTransfer = 30;
guyA.GiveCash(amountToTransfer, guyB);

console.log("\n--- After Transaction ---");
console.log(`${guyA.Name} balance: $${guyA.Cash}`); // Should be $70
console.log(`${guyB.Name} balance: $${guyB.Cash}`); // Should be $80
