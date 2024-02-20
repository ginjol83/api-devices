// General imports
import { camelCase } from 'lodash'
// Orchestrations imports
import { getOrchestrationsModel } from '../models/orchestrations/orchestrationsModel'
import { getOrchestrationsContainersViewByUuidModel } from '../models/orchestrations/orchestrationsContainersViewModel'
// Container checks imports
import { getVgmChecksByUuidModel, modifyVgmChecksModel as modifyContainersVgmChecksModel } from '../models/containers/vgmCheckModel'
import { getImportInlandChecksByUuidModel, modifyImportInlandChecksModel as modifyContainersImportInlandChecksModel } from '../models/containers/importInlandCheckModel'
import { getCustomsImportChecksByUuidModel, modifyCustomsImportChecksModel as modifyContainersCustomsImportCheckModel } from '../models/containers/customsImportCheckModel'
import { getTransportChecksByUuidModel, modifyTransportChecksModel as modifyContainersTransportChecksModel } from '../models/containers/transportCheckModel'
// Job checks imports
import { getVgmChecksByJobModel, modifyVgmChecksModel as modifyVgmChecksJobsModel } from '../models/jobs/vgmCheckModel'
import { getImportInlandCheckByJobModel, modifyImportInlandCheckModel as modifyImportInlandCheckJobsModel } from '../models/jobs/importInlandCheckModel'
import { getCustomsImportCheckByJobModel, modifyCustomsImportCheckModel as modifyCustomsImportCheckJobsModel } from '../models/jobs/customsImportCheckModel'
import { getTransportChecksByJobModel, modifyTransportChecksModel as modifyTransportChecksJobsModel } from '../models/jobs/transportCheckModel'
import { saveErrorLog } from './errorLogService'

// This service modifies the container checks if the job's checks are marked
// and marks the job checks if all the containers' checks are marked (Transport, VGM, Import Inland and Customs Import)

const modifyChecksService = (req, config) => {
	// recover container instance's uuid
	const { containerInstancesUuid, jobsUuid, check } = req.params

	if (containerInstancesUuid) {
		const kvpContainers = {
			'Container Transport Checks': getTransportChecksByUuidModel,
			'Container VGM Checks': getVgmChecksByUuidModel,
			'Container Import Inland Checks': getImportInlandChecksByUuidModel,
			'Container Customs Import Checks': getCustomsImportChecksByUuidModel
		}

		const kvpJobs = {
			'Container Transport Checks': getTransportChecksByJobModel,
			'Container VGM Checks': getVgmChecksByJobModel,
			'Container Import Inland Checks': getImportInlandCheckByJobModel,
			'Container Customs Import Checks': getCustomsImportCheckByJobModel
		}

		const kvpJobsModify = {
			'Container Transport Checks': modifyTransportChecksJobsModel,
			'Container VGM Checks': modifyVgmChecksJobsModel,
			'Container Import Inland Checks': modifyImportInlandCheckJobsModel,
			'Container Customs Import Checks': modifyCustomsImportCheckJobsModel
		}

		const checksUuids = {
			'Container Transport Checks': 'container_transport_checks_uuid',
			'Container VGM Checks': 'container_vgm_checks_uuid',
			'Container Import Inland Checks': 'container_import_inland_checks_uuid',
			'Container Customs Import Checks': 'container_customs_import_checks_uuid'
		}

		// recover orchestration's uuid
		return getOrchestrationsModel({ config, query: { containersUuid: containerInstancesUuid } }).then(
			(response2) => {
				const orchestrationUuid =
                    response2.data._data[Object.keys(response2.data._data)[0]][0].orchestrations_uuid
				const jobUuid = response2.data._data[Object.keys(response2.data._data)[0]][0].jobs_uuid

				// recover all orchestration's containers
				return getOrchestrationsContainersViewByUuidModel({
					config,
					params: { uuid: orchestrationUuid }
				}).then((response3) => {
					const allContainers = response3.data._data[Object.keys(response3.data._data)[0]]

					// recover checks for all the containers
					return Promise.all(
						allContainers.map((container) =>
							kvpContainers[check]({
								config,
								params: { uuid: container[checksUuids[check]] }
							})
						)
					).then((response4) => {
						const allChecks = response4.map(
							(item) => item.data._data[Object.keys(item.data._data)[0]][0]
						)

						// find all the checks which value is 1 (true) for all the containers
						// excludes ones that haven't been modified by the user
						const userQueryBody = req.body
						const valueKeys = Object.keys(allChecks[0])
							.filter((item) => !item.includes('date') && !item.includes('uuid'))
							.filter((item) => Object.keys(userQueryBody).includes(camelCase(item)))
						const dateKeys = Object.keys(allChecks[0])
							.filter((item) => item.includes('date'))
							.filter((item) => Object.keys(userQueryBody).includes(camelCase(item)))
						const userUuidKeys = Object.keys(allChecks[0])
							.filter((item) => item.includes('uuid') && item !== 'uuid')
							.filter((item) => Object.keys(userQueryBody).includes(camelCase(item)))

						// create body for global checks modifying
						const body = {}
						valueKeys.forEach((key) => {
							body[camelCase(key)] = allChecks.every((item) => item[key]) ? 1 : 0
						})
						dateKeys.forEach((key) => {
							body[camelCase(key)] = userQueryBody[camelCase(key)]
						})
						userUuidKeys.forEach((key) => {
							body[camelCase(key)] = req.auth.user.uuid
						})

						// modify global checks (if there's anything to modify)
						if (Object.keys(body).length) {
							// recover global check's uuid
							return kvpJobs[check]({ config, params: { uuid: jobUuid } }).then(
								(response5) => {
									const globalChecksUuid =
                                        response5.data._data[Object.keys(response5.data._data)[0]][0].uuid

									return kvpJobsModify[check]({
										config,
										body,
										params: { uuid: globalChecksUuid }
									})
								}
							)
						} else {

						}
					})
				})
			}
		)
			.catch((err) => {
				saveErrorLog({ req, config, err })
			})
	} else if (jobsUuid) {
		const kvp = {
			'Transport Checks': modifyContainersTransportChecksModel,
			'VGM Checks': modifyContainersVgmChecksModel,
			'Import Inland Checks': modifyContainersImportInlandChecksModel,
			'Customs Import Checks': modifyContainersCustomsImportCheckModel
		}

		const containerChecksUuids = {
			'Transport Checks': 'container_transport_checks_uuid',
			'VGM Checks': 'container_vgm_checks_uuid',
			'Import Inland Checks': 'container_import_inland_checks_uuid',
			'Customs Import Checks': 'container_customs_import_checks_uuid'
		}

		// recover orchestration's uuid
		return getOrchestrationsModel({ config, query: { jobsUuid } }).then((response2) => {
			const orchestrationUuid =
                response2.data._data[Object.keys(response2.data._data)[0]][0].orchestrations_uuid

			// recover all orchestration's containers
			return getOrchestrationsContainersViewByUuidModel({ config, params: { uuid: orchestrationUuid } }).then(
				(response3) => {
					const allContainers = response3.data._data[Object.keys(response3.data._data)[0]]
					const body = req.body

					// modify checks for all the containers
					return Promise.all(
						allContainers.map((container) => kvp[check] && kvp[check]({
							config,
							params: { uuid: container[containerChecksUuids[check]] },
							body
						})
						)
					)
				}
			)
		})
			.catch((err) => {
				saveErrorLog({ req, config, err })
			})
	}
}

export {
	modifyChecksService
}
