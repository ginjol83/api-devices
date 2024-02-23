const getDevicesQuery = (params) => {
    const uuidCondition = params.uuidDevice ? `and uuid like '${params.uuidDevice}' ` : ''
    return `SELECT 
        *
    FROM device_management.devices
        WHERE 1=1
        ${uuidCondition} 
    ;`
}
                                

const countDevicesQuery = () => `SELECT count(*) FROM device_management.devices;`

const insertDevicesQuery = () => {
    return `INSERT INTO device_management.devices (
            uuid,
            name,
            type,
            brand,
            model,
            registration_date,
            status 
        ) VALUES (
            :uuid,
            :name,
            :type,
            :brand,
            :model,
            :registration_date,
            :status
        );
        
        SELECT * FROM device_management.devices WHERE devices.uuid = :uuid;`
}

const modifyDevicesQuery = (params) => {
    const uuidCondition = params.uuidDevice ? `and uuid like '${params.uuidDevice}' ` : ''

    const nameCondition = params.name ?  'name = :name,' : ''
    const typeCondition = params.type ?  'type = :type,' : ''
    const brandCondition = params.brand ? 'brand = :brand,' : ''
    const modelCondition = params.model ? 'model = :model,' : ''
    const registrationDateCondition = params.registration_date ? 'registration_date = :registration_date,' : ''
    const statusCondition = params.status ? 'status = :status,' : ''

    return `UPDATE device_management.devices
                SET
                    ${nameCondition}
                    ${typeCondition}
                    ${brandCondition}
                    ${modelCondition}
                    ${registrationDateCondition}
                    ${statusCondition}
                    uuid = :uuid
                WHERE
                    uuid = :uuid;
                    
            SELECT * FROM device_management.devices WHERE devices.uuid = :uuid;`
            }

const deleteDevicesQuery = () => `DELETE FROM device_management.devices WHERE uuid = :uuid;`

export { getDevicesQuery, countDevicesQuery, insertDevicesQuery, modifyDevicesQuery, deleteDevicesQuery }