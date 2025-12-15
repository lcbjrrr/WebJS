class Pessoa {
  constructor(fn, ln) {
    this.firstName = fn;
    this.lastName = ln;
  }
  fullName() {
    return this.firstName + " " + this.lastName;
  }
};
luiz = new Pessoa("Luiz","Barboza")
nome = luiz.fullName();
console.log(nome)






