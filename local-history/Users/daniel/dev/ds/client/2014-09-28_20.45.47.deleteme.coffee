class Fruity

  constructor: (@apple) ->
    @constructorAtSign = 'here'
    constructorColon: 'here'
    constructorAssignment = 'here'

  @classAtSign = 'here'
  classColon: 'here'
  classAssignment = 'here'


console.log 'In constructor:'
fruity = new Fruity 'Golden delicious'
console.log "fruity.constructorAtSign: #{fruity.constructorAtSign}"
console.log "fruity.constructorColon: #{fruity.constructorColon}"
console.log "fruity.constructorAssignment: #{fruity.constructorAssignment}"
console.log "fruity.classAtSign: #{Fruity.classAtSign}"
console.log "fruity.classColon: #{Fruity.classColon}"
console.log "fruity.classAssignment: #{Fruity.classAssignment}"

console.log '\nIn class:'
console.log "Fruity.constructorAtSign: #{fruity.constructorAtSign}"
console.log "Fruity.constructorColon: #{fruity.constructorColon}"
console.log "Fruity.constructorAssignment: #{fruity.constructorAssignment}"
console.log "Fruity.classAtSign: #{Fruity.classAtSign}"
console.log "Fruity.classColon: #{Fruity.classColon}"
console.log "Fruity.classAssignment: #{Fruity.classAssignment}"
