import moment from 'moment'
import { getAutomationsServiceModel } from '../models/states/automationsServiceModel'
import { getOperationsModel } from '../models/states/operationsModel'
import { getJobsByUuidModel } from '../models/jobs/jobsModel'
import { getOrchestrationsModel } from '../models/orchestrations/orchestrationsModel'
import { getOrchestrationsChecklistsFullViewModel } from '../models/orchestrations/checklistsFullViewModel'

import { modifyBookingChecksModel } from '../models/jobs/bookingCheckModel'
import { modifyDocChecksModel } from '../models/jobs/docCheckModel'
import { modifyImportInlandCheckModel } from '../models/jobs/importInlandCheckModel'

const models = {
	modifyBookingChecksModel,
	modifyDocChecksModel,
	modifyImportInlandCheckModel
}

const evaluateCondition = (operationValue, value1, value2) => {
	const numValue1 = isNaN(Number(value1)) ? value1 : Number(value1)
	const numValue2 = isNaN(Number(value2)) ? value2 : Number(value2)

	const operations = {
		'===': numValue1 === numValue2,
		'!==': numValue1 !== numValue2,
		'>': numValue1 > numValue2,
		'<': numValue1 < numValue2,
		'>=': numValue1 >= numValue2,
		'<=': numValue1 <= numValue2
	}

	return operations[operationValue] || false
}

const applyAutomation = (automation, data, operationsMap) => {
	const conditions = automation.conditions
	const effects = automation.effects

	const allConditionsMet = conditions.every((condition) => {
		const conditionProperty = condition.conditions_db_fields_alt_name
		const conditionValue = condition.conditions_has_db_fields_expected_value
		const conditionOperationName = condition.conditions_operations_name
		const conditionOperationValue = operationsMap[conditionOperationName]

		return evaluateCondition(conditionOperationValue, data[conditionProperty], conditionValue)
	})

	if (allConditionsMet) {
		const effectsData = effects.map((effect) => {
			const effectProperty = effect.effects_db_fields_name
			const effectValue = isNaN(Number(effect.effects_has_db_fields_expected_value))
				? effect.effects_has_db_fields_expected_value
				: Number(effect.effects_has_db_fields_expected_value)

			const now = moment.utc().format('YYYY-MM-DD HH:mm:ss')
			const newData = {
				[effectProperty]: effectValue,
				[`${effectProperty}Date`]: now,
				[`${effectProperty}UserUuid`]: '45fb33dc-1717-11ee-b3cc-bce92f846527' // Automation User
			}

			return { newData, modelName: effect.effects_db_fields_model }
		})

		return effectsData
	}

	return []
}

const automationService = ({ config, jobsUuid, otherData }) => {
	return Promise.all([
		getAutomationsServiceModel({ config, query: { enable: 1 } }),
		getOperationsModel({ config })
	])
		.then(([automations, operations]) => {
			const operationsMap = operations.data._data.operations.reduce((map, operation) => {
				map[operation.name] = operation.value
				return map
			}, {})

			const automationsData = automations.data._data.automations

			const jobsArray = Array.isArray(jobsUuid) ? jobsUuid : [jobsUuid]

			const promises = jobsArray.map((jobUuid) => {
				// Get the orchestrations model
				return getOrchestrationsModel({ config, query: { jobsUuid: jobUuid } }).then((orch) => {
					const orchUuid = orch.data._data[Object.keys(orch.data._data)[0]][0].orchestrations_uuid
					// Get the orchestrations checklists full view model
					return getOrchestrationsChecklistsFullViewModel({ config, params: { uuid: orchUuid } }).then((checkListData) => {
						// Merge the orchestrations checklists full view model with the other data
						const mergedData = { ...checkListData.data._data[Object.keys(checkListData.data._data)[0]][0], ...otherData }

						// Apply automations
						const modifiedDataList = automationsData.map((automation) => {
							return applyAutomation(automation, mergedData, operationsMap)
						})

						const flattenedModifiedDataList = modifiedDataList.flat()

						const modifiedDataByModel = flattenedModifiedDataList.reduce((acc, { newData, modelName }) => {
							if (newData !== null && modelName !== null) {
								acc[modelName] = acc[modelName] ? [...acc[modelName], newData] : [newData]
							}

							return acc
						}, {})

						if (Object.keys(modifiedDataByModel).length === 0) {
							return { success: false, message: 'No automations to apply.' }
						}

						return getJobsByUuidModel({ config, params: { uuid: jobUuid } }).then((res) => {
							const jobs = res.data._data[Object.keys(res.data._data)[0]]

							const promises = jobs.map((job) => {
							  const modelPromises = Object.keys(modifiedDataByModel).map((modelName) => {
									const baseUuid = ((modelName) => {
								  const regex = /([A-Z])/g
								  const result = modelName.replace('modify', '').replace('Model', '').replace(regex, '_$1').toLowerCase() + '_uuid'
								  return result.charAt(0) === '_' ? result.slice(1) : result
									})(modelName)

									const value = job[baseUuid]

									if (value) {
								  return modifiedDataByModel[modelName].map((data) => {
											return models[modelName]({ config, body: data, params: { uuid: value } }).then((result) => {
									  return { modelName, data: result.data._data }
											})
								  })
									}
							  })

							  return Promise.all(modelPromises.flat())
							})

							return Promise.all(promises)
							  .then((results) => {
									const updatedData = results.reduce((acc, result) => {
								  result.forEach(({ modelName, data }) => {
											acc[modelName] = acc[modelName] ? [...acc[modelName], data] : [data]
								  })
								  return acc
									}, {})

									return { success: true, message: 'Modifications applied successfully.', data: updatedData }
							  })
						  })
					})
				})
			})

			return Promise.all(promises)
				.then((results) => results)
				.catch((error) => {
					console.error(error?.message || error)
					return { success: false, message: 'Error applying modifications.' }
				})
		})
		.catch((error) => {
			console.error(error?.message || error)
			return { success: false, message: 'Error applying modifications.' }
		})
}

export { automationService }
