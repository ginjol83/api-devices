import { getCostProvisionsByUuidModel, modifyCostProvisionsModel } from '../models/accounting/costProvisionsModel'
import { getRevenueProvisionsByUuidModel, modifyRevenueProvisionsModel } from '../models/accounting/revenueProvisionsModel'
import { getOrchestrationsHasCostProvisionsModel } from '../models/orchestrations/orchestrationsHasCostProvisions'
import { getOrchestrationsHasRevenueProvisionsModel } from '../models/orchestrations/orchestrationsHasRevenueProvisions'
import { getOrchestrationsModel } from '../models/orchestrations/orchestrationsModel'

// INVOICING CHECKS
const invoicingChecksAutomationService = (config, checksResponse) => {
	// When an orchestration gets 'Ready To Invoice' (Invoicing Checklist) marked true
	// this function will update all Cost and Revenue Provisions of this orchestration to be 'Ready for Accounting' and 'Ready to Invoice' = true
	const readyToInvoiceCheck = checksResponse.data._data.invoicingChecks[0].ready_to_invoice
	const jobsUuid = checksResponse.data._data.invoicingChecks[0].jobs_uuid

	return !readyToInvoiceCheck
		? Promise.resolve()
		: getOrchestrationsModel({ config, query: { jobsUuid } }).then((resultOrch) => {
			const orchestrationsUuid = resultOrch.data._data.orchestrations[0].orchestrations_uuid
			return Promise.all([
				getOrchestrationsHasRevenueProvisionsModel({ config, params: { uuid: orchestrationsUuid } }),
				getOrchestrationsHasCostProvisionsModel({ config, params: { uuid: orchestrationsUuid } })
			])
				.then(([resultRev, resultCost]) => {
					const orchestrationHasRevenueProvisionUuids =
                          resultRev.data._data.orchestrationsHasRevenueProvisions.map(
                          	(item) => item.revenue_provisions_uuid
                          )
					const orchestrationHasCostProvisionUuids =
                          resultCost.data._data.orchestrationsHasCostProvisions.map(
                          	(item) => item.cost_provisions_uuid
                          )
					// It was requested not to change the modifiedBy value when modifying the provisions with this automatization, so we get the previous value and send it in the PUT query
					return Promise.all([
						Promise.all(
							orchestrationHasRevenueProvisionUuids.map((revenueProvisionUuid) => {
								// get the revenue provision
								return getRevenueProvisionsByUuidModel({
									config,
									params: { uuid: revenueProvisionUuid }
								}).then((response) => {
									const revenueProvision = response.data._data.revenueProvisions[0]
									const rawDate = revenueProvision.date_updated
									const dateUpdated = rawDate
										? rawDate.slice(0, 10) + ' ' + rawDate.slice(11, 16)
										: null
									// modify the revenue provision and keep the last user_updated_uuid and date_updated values
									return modifyRevenueProvisionsModel({
										config,
										body: { readyToInvoice: true, dateUpdated },
										headers: { 'uuid-requester': revenueProvision.user_updated_uuid || '' },
										params: { uuid: revenueProvisionUuid }
									})
								})
							})
						),
						Promise.all(
							orchestrationHasCostProvisionUuids.map((costProvisionUuid) => {
								// get the cost provision
								return getCostProvisionsByUuidModel({
									config,
									params: { uuid: costProvisionUuid }
								}).then((response) => {
									const costProvision = response.data._data.costProvisions[0]
									const rawDate = costProvision.date_updated
									const dateUpdated = rawDate
										? rawDate.slice(0, 10) + ' ' + rawDate.slice(11, 16)
										: null
									// modify the cost provision and keep the last user_updated_uuid and date_updated values
									return modifyCostProvisionsModel({
										config,
										body: { readyForAccounting: true, dateUpdated },
										headers: { 'uuid-requester': costProvision.user_updated_uuid || '' },
										params: { uuid: costProvisionUuid }
									})
								})
							})
						)
					])
				})
		})
}

export { invoicingChecksAutomationService }
