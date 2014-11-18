class Fruity

  constructor: (@apple) ->
    @atSign = '@ in constructor'
    colon: ': in constructor'
    assignment = 'normal assignment in constructor'

  @atSign = '@ in class'
  colon: ': in class'
  assignment = 'normal assignment in class'


console.log 'In constructor:'
fruity = new Fruity 'Golden delicious'
console.log "fruity.apple: #{fruity.apple}"
console.log "fruity.banana: #{fruity.banana}"
console.log "fruity.orange: #{fruity.orange}"

console.log '\nIn class:'
console.log "Fruity.apple: #{Fruity.apple}"
console.log "Fruity.banana: #{Fruity.banana}"
console.log "Fruity.orange: #{Fruity.orange}"
