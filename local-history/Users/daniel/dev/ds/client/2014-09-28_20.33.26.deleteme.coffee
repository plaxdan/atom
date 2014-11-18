class Fruity

  constructor: (@apple) ->
    @banana = '@ in constructor'
    banana: ': in constructor'
    banana = 'normal assignment in constructor'


  @banana = '@ in class'
  banana: ': in class'
  banana = 'normal assignment in class'


console.log Fruity.apple
console.log Fruity.banana
console.log Fruity.orange
fruity = new Fruity 'Golden delicious'
console.log fruity.apple
console.log fruity.banana
console.log fruity.orange
