class Fruity

  constructor: (@apple) ->
    @constructorAtSign = '@ in constructor'
    constructorColon: 'assigned with a colon'
    constructorAssignment = 'normal assignment in constructor'

  @classAtSign = 'class property'
  classColon: 'instance property'
  classAssignment = 'local assignment'


console.log 'In constructor:'
fruity = new Fruity 'Golden delicious'
console.log "fruity.atSign: #{fruity.atSign}"
console.log "fruity.colon: #{fruity.colon}"
console.log "fruity.assignment: #{fruity.assignment}"

console.log '\nIn class:'
console.log "Fruity.atSign: #{Fruity.atSign}"
console.log "Fruity.colon: #{Fruity.colon}"
console.log "Fruity.assignment: #{Fruity.assignment}"
