class Fruity

  constructor: (@constructorArg) ->
    @constructorAtSign = 'here'
    constructorColon: 'here'
    constructorAssignment = 'here'

  @bodyAtSign = 'here'
  bodyColon: 'here'
  bodyAssignment = 'here'


console.log 'On instance:'
fruity = new Fruity 'Golden delicious'
console.log "fruity.constructorArg: #{fruity.constructorArg}"
console.log "fruity.constructorAtSign: #{fruity.constructorAtSign}"
console.log "fruity.constructorColon: #{fruity.constructorColon}"
console.log "fruity.constructorAssignment: #{fruity.constructorAssignment}"
console.log "fruity.bodyAtSign: #{fruity.bodyAtSign}"
console.log "fruity.bodyColon: #{fruity.bodyColon}"
console.log "fruity.bodyAssignment: #{fruity.bodyAssignment}"

console.log '\nOn class:'
console.log "Fruity.constructorArg: #{Fruity.constructorArg}"
console.log "Fruity.constructorAtSign: #{Fruity.constructorAtSign}"
console.log "Fruity.constructorColon: #{Fruity.constructorColon}"
console.log "Fruity.constructorAssignment: #{fruity.constructorAssignment}"
console.log "Fruity.bodyAtSign: #{Fruity.bodyAtSign}"
console.log "Fruity.bodyColon: #{Fruity.bodyColon}"
console.log "Fruity.bodyAssignment: #{Fruity.bodyAssignment}"
