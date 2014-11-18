class Fruity

  constructor: (@apple) ->
    @banana = '@ in constructor'
    banana: ': in constructor'
    banana = 'normal assignment in constructor'

  @banana = '@ in class'
  banana: ': in class'
  banana = 'normal assignment in class'


console.log 'In constructor:'
fruity = new Fruity 'Golden delicious'
console.log "fruity.apple: #{fruity.apple}"
console.log "fruity.banana: #{fruity.banana}"
console.log "fruity.orange: #{fruity.orange}"

console.log 'In class:'
console.log "Fruity.apple: #{Fruity.apple}"
console.log "Fruity.banana: #{Fruity.banana}"
console.log "Fruity.orange: #{Fruity.orange}"
