class MyClass

  constructor: (@constructorArg) ->
    @constructorAtSign = 'here'
    constructorColon: 'here'
    constructorAssignment = 'here'

  @bodyAtSign = 'here'
  bodyColon: 'here'
  bodyAssignment = 'here'


console.log 'On instance:'
fruity = new MyClass 'passed to ctor'
console.log "fruity.constructorArg: #{fruity.constructorArg}"
console.log "fruity.constructorAtSign: #{fruity.constructorAtSign}"
console.log "fruity.constructorColon: #{fruity.constructorColon}"
console.log "fruity.constructorAssignment: #{fruity.constructorAssignment}"
console.log "fruity.bodyAtSign: #{fruity.bodyAtSign}"
console.log "fruity.bodyColon: #{fruity.bodyColon}"
console.log "fruity.bodyAssignment: #{fruity.bodyAssignment}"

console.log '\nOn class:'
console.log "MyClass.constructorArg: #{MyClass.constructorArg}"
console.log "MyClass.constructorAtSign: #{MyClass.constructorAtSign}"
console.log "MyClass.constructorColon: #{MyClass.constructorColon}"
console.log "MyClass.constructorAssignment: #{fruity.constructorAssignment}"
console.log "MyClass.bodyAtSign: #{MyClass.bodyAtSign}"
console.log "MyClass.bodyColon: #{MyClass.bodyColon}"
console.log "MyClass.bodyAssignment: #{MyClass.bodyAssignment}"