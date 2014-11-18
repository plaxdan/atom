class Fruity

  constructor: (@constructorArg) ->
    @constructorAtSign = 'here'
    constructorColon: 'here'
    constructorAssignment = 'here'

  @classAtSign = 'here'
  classColon: 'here'
  classAssignment = 'here'


console.log 'In constructor:'
fruity = new Fruity 'Golden delicious'
console.log "fruity.constructorArg: #{fruity.constructorArg}"
console.log "fruity.constructorAtSign: #{fruity.constructorAtSign}"
console.log "fruity.constructorColon: #{fruity.constructorColon}"
console.log "fruity.constructorAssignment: #{fruity.constructorAssignment}"
console.log "fruity.classAtSign: #{fruity.classAtSign}"
console.log "fruity.classColon: #{fruity.classColon}"
console.log "fruity.classAssignment: #{fruity.classAssignment}"

console.log '\nIn class:'
console.log "Fruity.constructorArg: #{Fruity.constructorArg}"
console.log "Fruity.constructorAtSign: #{Fruity.constructorAtSign}"
console.log "Fruity.constructorColon: #{Fruity.constructorColon}"
console.log "Fruity.constructorAssignment: #{fruity.constructorAssignment}"
console.log "Fruity.classAtSign: #{Fruity.classAtSign}"
console.log "Fruity.classColon: #{Fruity.classColon}"
console.log "Fruity.classAssignment: #{Fruity.classAssignment}"
