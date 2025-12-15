var person = {
  firstName: "John",
  lastName: "Doe",
  fullName : function() {
    return this.firstName + " " + this.lastName;
  }
};

console.log(person.lastName); // OO like
// OR
console.log(person["lastName"]); // dic like



