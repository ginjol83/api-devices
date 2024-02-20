import { modifyBookingChecksModel } from '../models/jobs/bookingCheckModel'
import { modifyCustomChecksModel } from '../models/jobs/customCheckModel'
import { getJobsByUuidModel } from '../models/jobs/jobsModel'
import { modifyWaiverChecksModel } from '../models/jobs/waiverCheckModel'
import { getCountriesModel } from '../models/journeys/countriesModel'
import { getPlacesByUuidModel } from '../models/journeys/placesModel'

const markCountryCheck = (config, pathsUuid, orchUuids = [], jobUuids = []) => {
	return getPlacesByUuidModel({ config, params: { uuid: pathsUuid } })
		.then(res1 => {
			const countryUuid = res1.data._data.places[0].countries_uuid
			const countryName = res1.data._data.places[0].countries_name
			const japanUuid = '26db64fb-3ddc-11ea-8094-408d5cc834ec'
			const usaUuid = '26db9b0b-3ddc-11ea-8094-408d5cc834ec'
			return getCountriesModel({ config, query: { name: countryName } })
				.then(res2 => {
					return Promise.all(jobUuids.map(jobUuid => getJobsByUuidModel({ config, params: { uuid: jobUuid } })))
						.then(res3 => {
							const data2 = res3.map(item => item.data._data[Object.keys(item.data._data)[0]][0])
							Promise.all([
								data2.filter(item => item.waiver_checks_uuid).map(job => modifyWaiverChecksModel({ config, params: { uuid: job.waiver_checks_uuid }, body: { destinationWaiverRequired: Number(res2.data._data.countries[0].waiver_required) } })),
								data2.filter(item => item.customs_checks_uuid).map(job => modifyCustomChecksModel({ config, params: { uuid: job.customs_checks_uuid }, body: { japanPositioning: countryUuid === japanUuid } })),
								data2.filter(item => item.bookings_checks_uuid).map(job => modifyBookingChecksModel({ config, params: { uuid: job.bookings_checks_uuid }, body: { shipmentFromToUsa: countryUuid === usaUuid } }))
							])
								.catch(err => {
									const errResponse = err.response || { status: 500 }
									const error = errorHandler(
										{ err: errResponse.error, message: errResponse.data && (errResponse.data || {}).message || err.message || 'Server Error' }
										, config.environment
									)
									res.status(errResponse.status).json(error)
								})
							return data2
						})
				})
		})
		.catch(err => {
			const errResponse = err.response || { status: 500 }
			const error = errorHandler(
				{ err: errResponse.error, message: errResponse.data && (errResponse.data || {}).message || err.message || 'Server Error' }
				, config.environment
			)
			res.status(errResponse.status).json(error)
		})
}

export { markCountryCheck }
