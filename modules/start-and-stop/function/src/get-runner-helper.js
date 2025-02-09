const Compute = require('@google-cloud/compute')
const compute = new Compute()
const zone = compute.zone(require('./google-settings').zone())
const env = require('./google-settings').env()

module.exports.getRunnersVms = getRunnersVms
module.exports.getAllRunnersVms = getAllRunnersVms
module.exports.getRunnerVmByName = getRunnerVmByName
module.exports.getAgedRunnersVms = getAgedRunnersVms

async function getRunnersVms () {
  const filter = `labels.env=${env}`
  const options = {
    filter: filter
  }
  const [vms] = await compute.getVMs(options)
  return vms
}

async function getRunnerVmByName (vmName) {
  return zone.vm(vmName)
}

async function getAllRunnersVms () {
  const filter = `labels.env=${env}`
  const options = {
    filter: filter
  }
  const [vms] = await compute.getVMs(options)
  return vms
}

async function getAgedRunnersVms () {
  const vms = await getAllRunnersVms()
  const vmsAgeMinutes = await Promise.all(vms.map(async vm => {
    const [metadata] = await vm.getMetadata()
    const startDate = Date.parse(metadata.creationTimestamp)
    const now = new Date()
    const vmAgeMinutes = (now - startDate) / 1000 / 60
    return vmAgeMinutes
  }))
  const agedVms = vms.filter((vm, index, array) => {
    return vmsAgeMinutes[index] > 24 * 60 // 1 day
  })
  return agedVms
}
