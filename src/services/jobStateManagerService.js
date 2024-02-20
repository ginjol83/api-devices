import { saveErrorLog } from './errorLogService'
import { getjobStatesFieldsViewByUuidModel } from '../models/orchestrations/jobStatesFieldsViewModel'
import { getOrchestrationsChecklistsFullViewModel } from '../models/orchestrations/checklistsFullViewModel'
import { getNextStatesModel } from '../models/states/nextStatesModel'
import { postFinishedStatesModel } from '../models/states/finishedStatesModel'
import { getStatesModel } from '../models/states/statesModel'
import { getOrchestrationsHasStatesModel, modifyOrchestrationsHasStatesModel, insertOrchestrationsHasStatesModel, deleteOrchestrationsHasStatesModel } from '../models/orchestrations/orchestrationsHasStates'
import { deleteOrchestrationsHasActiveStatesModel, getOrchestrationsHasActiveStatesModel, insertOrchestrationsHasActiveStatesModel } from '../models/orchestrations/orchestrationsHasActiveStates'
import { getDbFieldsModel } from '../models/states/dbFieldsModel'
import asyncLock from 'async-lock'
import { modifyOrchestrationsModel } from '../models/orchestrations/orchestrationsModel'

const lock = new asyncLock({ maxPending: 1 })

const sortByWeight = (a, b) => (a.weight > b.weight ? 1 : b.weight > a.weight ? -1 : 0)

const mergeStates = (statesList = [], activeStatesList = [], finishedStatesList = []) => {
	const parentStates = statesList
		.filter((x) => !x.parent_uuid)
		.map((parent) => {
			const done = finishedStatesList.filter((item) => item.uuid === parent.uuid).length ? 1 : 0
			const activeChildren = activeStatesList
				.filter((x) => x.parent_uuid === parent.uuid)
				.sort(sortByWeight)
			const finishedChildren = finishedStatesList
				.filter((x) => x.parent_uuid === parent.uuid)
				.sort(sortByWeight)
			return { done, activeChildren, finishedChildren, ...parent }
		})
		.sort(sortByWeight)
	return parentStates
}

const createRelations = (req, orchestrationStatus, config) => {
	const { done, activeChildren, finishedChildren } = orchestrationStatus
	return insertOrchestrationsHasStatesModel({
		config,
		params: {
			uuid: req.params.uuid
		},
		body: {
			stateUuid: orchestrationStatus.uuid,
			done,
			activeStates: activeChildren.map(item => item.name).join(),
			finishedStates: finishedChildren.map(item => item.name).join()
		}
	})
}

const modifyRelations = (req, orchestrationStatus, config) => {
	const { done, activeChildren, finishedChildren } = orchestrationStatus
	return modifyOrchestrationsHasStatesModel({
		config,
		params: {
			uuid: req.params.uuid,
			uuid2: orchestrationStatus.uuid
		},
		body: {
			done,
			activeStates: activeChildren.map(item => item.name).join(),
			finishedStates: finishedChildren.map(item => item.name).join()
		}
	})
}

const deleteRelations = (req, orchestrationStatus, config) => {
	return deleteOrchestrationsHasStatesModel({ config, params: { uuid: orchestrationStatus.orchestrations_uuid, uuid2: orchestrationStatus.states_uuid } })
}

const jobStateManagerService = (req, config) => {
	const uuid = req.params.uuid

	return lock.acquire(uuid, () => {
		// recover information necessary for calculating states
		return Promise.all([
			getjobStatesFieldsViewByUuidModel({ config, params: req.params }),
			getOrchestrationsChecklistsFullViewModel({ config, params: req.params })
		])
			.then(async ([jobData, checklistData]) => {
				// all checks data (there's always gonna be only one object)
				const checklistPayload = checklistData.data._data.checklistsFullView

				// all the other data (there might be multiple objects in the response)
				const jobPayload = jobData.data._data.jobStatesFieldsView
				const teamUuid = jobPayload[0]?.team_uuid || null

				const shipmentType = jobPayload[0]?.shipment_types_name || null
				const operationType = jobPayload[0]?.operation_types_name || null

				// data merged
				const orchestrationsDataForConditions = jobPayload.map(item => ({ ...item, ...checklistPayload[0] }))

				// recover all conditioned db fields from database
				const dbFieldsData = await getDbFieldsModel({ config, query: { limit: 9999999999 } })
				const dbFieldsDataUnpacked = dbFieldsData.data._data[Object.keys(dbFieldsData.data._data)[0]]

				// check how many conditions are met
				const completedChecks = dbFieldsDataUnpacked.reduce((acc, currVal) => {
					return ({
						...acc,
						[currVal.name]: orchestrationsDataForConditions.every((x) => {
							if (typeof x[currVal.alt_name] === 'string') {
								return Boolean(x[currVal.alt_name]) === Boolean(currVal.expected_value)
							} else {
								return Number(x[currVal.alt_name]) === Number(currVal.expected_value)
							}
						})
					})
				}, {})

				const statesToExcludeDictionary = {
					TRUCK: {
						EXPORT: ['BOOKING STATUS', 'VGM STATUS', 'DOCUMENTAL STATUS', 'IMPORT STATUS', 'IMPORT CUSTOMS STATUS', 'INLAND AT DESTINATION STATUS', 'WAIVER STATUS'],
						IMPORT: ['BOOKING STATUS', 'VGM STATUS', 'CUSTOMS STATUS', 'DOCUMENTAL STATUS', 'IMPORT STATUS', 'WAIVER STATUS'],
						INTRACOMUNITARY: ['VGM STATUS', 'DOCUMENTAL STATUS', 'WAIVER STATUS']
					},
					AIR: {
						EXPORT: ['VGM STATUS', 'IMPORT STATUS', 'IMPORT CUSTOMS STATUS', 'INLAND AT DESTINATION STATUS'],
						IMPORT: ['BOOKING STATUS', 'TRANSPORT STATUS', 'VGM STATUS', 'CUSTOMS STATUS', 'DOCUMENTAL STATUS', 'WAIVER STATUS']
					},
					'MARITIM FCL': {
						EXPORT: ['IMPORT STATUS', 'IMPORT CUSTOMS STATUS', 'INLAND AT DESTINATION STATUS'],
						IMPORT: ['VGM STATUS', 'CUSTOMS STATUS', 'TRANSPORT STATUS', 'DOCUMENTAL STATUS', 'WAIVER STATUS']
					},
					'ADDITIONAL SERVICES': {
						EXPORT: ['IMPORT STATUS', 'IMPORT CUSTOMS STATUS', 'INLAND AT DESTINATION STATUS', 'TRACKING STATUS'],
						IMPORT: ['VGM STATUS', 'CUSTOMS STATUS', 'TRANSPORT STATUS', 'WAIVER STATUS', 'TRACKING STATUS'],
						INTRACOMUNITARY: ['WAIVER STATUS', 'TRACKING STATUS']
					}
				}

				const statesToExclude = statesToExcludeDictionary[shipmentType]?.[operationType] || []

				// convert completed conditions into a coma-separated string
				const completedChecksString = Object.keys(completedChecks).filter((x) => completedChecks[x]).join(',') || ''

				// find out finished states and active states
				return Promise.allSettled([
					getStatesModel({ config, query: { limit: 100000, partyDelegationTeamUuid: teamUuid, statesToExclude } }),
					postFinishedStatesModel({ config, body: { completed: completedChecksString, partyDelegationUuid: teamUuid, limit: 100000 } }),
					getNextStatesModel({ config, query: { completed: completedChecksString, partyDelegationUuid: teamUuid, limit: 100000 } })
				])
					.then(([allStates, finishedStates, activeStates]) => {
						const allStatesList = (allStates.status == 'fulfilled' && allStates.value.data._data.states) || []
						const finishedStatesList = (finishedStates.status == 'fulfilled' && finishedStates.value.data._data.finishedState) || []
						const activeStatesList = (activeStates.status == 'fulfilled' && activeStates.value.data._data.nextState.map(item => (item.weight > 4999 && item.weight < 5981) || (item.weight > 999 && item.weight < 1891) || (item.weight > 1999 && item.weight < 2991) || (item.weight > 3999 && item.weight < 4991) ? ({ ...item, name: item.weight.toString().slice(-3) + ' - ' + item.name }) : item)) || []
						const mergedStatusList = mergeStates(allStatesList, activeStatesList, finishedStatesList)

						// UPDATE orchestrations_has_states AND orchestrations_has_active_states_tables
						// WHICH ARE NEEDED FOR STATES LIST IN THE CLIENT AND SOME REPORTS
						return Promise.all([
							// update orchestrations has states
							getOrchestrationsHasStatesModel({ config, params: req.params }).then(async (res) => {
								const currentOrchestrationStates = res.data._data.orchestrationsHasStates

								// check if there are any states that are not yet saved in orchestrations has states
								const actualRelationsStateUuids = currentOrchestrationStates.map((item) => item.states_uuid)

								const statesWithoutRelationCreated = mergedStatusList.filter((item) => !actualRelationsStateUuids.includes(item.uuid))

								const statesWithRelationCreated = mergedStatusList.filter((item) => actualRelationsStateUuids.includes(item.uuid))

								const relationsToDelete = currentOrchestrationStates.filter((item) => !mergedStatusList.map(el => el.uuid).includes(item.states_uuid))

								return relationsToDelete.reduce((prevTask, item) => {
									return prevTask.then(() => deleteRelations(req, item, config))
								}, Promise.resolve())
									.then(() => {
										// create relations if there are any to create
										return statesWithoutRelationCreated.reduce((prevTask, item) => {
											return prevTask.then(() => createRelations(req, item, config))
										}, Promise.resolve())
											.then(() => {
												// modify all existing relations
												return statesWithRelationCreated.reduce((prevTask, item) => {
													return prevTask.then(() => modifyRelations(req, item, config))
												}, Promise.resolve())
											})
									})
							}),
							// update orchestrations has active states
							getOrchestrationsHasActiveStatesModel({ config, params: req.params }).then(async (res) => {
								const currentActiveStates = res.data._data.orchestrationsHasActiveStates

								// check if there are any states that are not yet saved in orchestrations has active states
								const actualRelationsStateUuids = currentActiveStates.map((item) => item.states_uuid)

								const statesWithoutRelationCreated = activeStatesList.filter((item) => !actualRelationsStateUuids.includes(item.uuid))

								const relationsToDelete = currentActiveStates.filter((item) => !activeStatesList.map(el => el.uuid).includes(item.states_uuid))

								// delete relations if there are any to delete
								return relationsToDelete.reduce((prevTask, item) => {
									return prevTask.then(() => deleteOrchestrationsHasActiveStatesModel({ config, params: { uuid: item.orchestrations_uuid, uuid2: item.states_uuid } }))
								}, Promise.resolve())
									.then(() => {
										// create relations if there are any to create
										return statesWithoutRelationCreated.reduce((prevTask, item) => {
											return prevTask.then(() => insertOrchestrationsHasActiveStatesModel({ config, params: { uuid: req.params.uuid }, body: { stateUuid: item.uuid } }))
										}, Promise.resolve())
									})
							})
						])
							.then(() => {
								return modifyOrchestrationsModel({
									config,
									params: { uuid: req.params.uuid },
									headers: { 'uuid-requester': req.auth.user.uuid }
								})
							})
					})
			})
			.catch((err) => {
				saveErrorLog({ req, config, err })
			})
	})
		.catch(() => {}) // This catch is here to control the error of the lock.acquire and to not see the error in the terminal
}

export { jobStateManagerService }
