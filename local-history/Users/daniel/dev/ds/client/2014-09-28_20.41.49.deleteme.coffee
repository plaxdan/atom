class Fruity

  constructor: (@apple) ->
    @atSign = '@ in constructor'
    colon: 'assigned with a colon'
    assignment = 'normal assignment in constructor'

  @atSign = '@ in class'
  colon: 'assigned with a colon'
  assignment = 'normal assignment in class'


console.log 'In constructor:'
fruity = new Fruity 'Golden delicious'
console.log "fruity.atSign: #{fruity.atSign}"
console.log "fruity.colon: #{fruity.colon}"
console.log "fruity.assignment: #{fruity.assignment}"

console.log '\nIn class:'
console.log "Fruity.atSign: #{Fruity.atSign}"
console.log "Fruity.colon: #{Fruity.colon}"
console.log "Fruity.assignment: #{Fruity.assignment}"
