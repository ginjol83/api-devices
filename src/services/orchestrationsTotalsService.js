import asyncLock from 'async-lock'
import { getOrchestrationsModel, modifyOrchestrationsModel } from '../models/orchestrations/orchestrationsModel'
import { getOrchestrationsHasContainersModel } from '../models/orchestrations/orchestrationsHasContainers'
import { getContainerInstancesByUuidModel } from '../models/containers/containerInstancesModel'
import { saveErrorLog } from './errorLogService'

const lock = new asyncLock({ maxPending: 1 })

const orchestrationsTotalsService = ({ req, config, containerInstancesUuid }) => {
	// recover orchestration
	return getOrchestrationsModel({ config, query: { containersUuid: containerInstancesUuid } })
		.then(res => {
			const orchestrationsData = res.data._data[Object.keys(res.data._data)[0]][0]
			const orchestrationsUuid = orchestrationsData.orchestrations_uuid

			lock.acquire(orchestrationsUuid, () => {
				// recover all container instances
				getOrchestrationsHasContainersModel({ config, params: { uuid: orchestrationsUuid } })
					.then(res2 => {
						const orchestrationContainersData = res2.data._data[Object.keys(res2.data._data)[0]]

						return Promise.all(orchestrationContainersData.map(container => getContainerInstancesByUuidModel({ config, params: { uuid: container.containers_uuid } })))
							.then(res3 => {
								const key = Object.keys(res3[0].data._data)[0]
								const containersData = res3.map(container => container.data._data[key][0])

								// calculate totals
								const totals = containersData.reduce((acc, currVal) => ({
									totalCubicMeters: acc.totalCubicMeters + (currVal.cubic_meters_total || 0),
									totalGrossWeight: acc.totalGrossWeight + (currVal.weight_gross_total || 0),
									totalNetWeight: acc.totalNetWeight + (currVal.weight_net_total || 0),
									totalBundles: acc.totalBundles + (currVal.number_of_bundles_total || 0),
									totalTeu: acc.totalTeu + (currVal.teu || 0)
								}), {
									totalCubicMeters: 0,
									totalGrossWeight: 0,
									totalNetWeight: 0,
									totalBundles: 0,
									totalTeu: 0
								})

								// save totals in the orchestrations table
								return modifyOrchestrationsModel({ config, params: { uuid: orchestrationsUuid }, body: totals })
							})
					})
					.catch((err) => {
						saveErrorLog({ req, config, err })
					})
			})
				.catch(err => saveErrorLog({ req, config, err }))
		})
		.catch((err) => {
			saveErrorLog({ req, config, err })
		})
}

export { orchestrationsTotalsService }
