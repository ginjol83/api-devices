const getDevicesQuery = () => `SELECT * FROM device_management.devices;`

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

const modifyDevicesQuery = () => {
    return `UPDATE device_management.devices
                SET
                    name = :name,
                    type = :type,
                    brand = :brand,
                    model = :model,
                    registration_date = :registration_date,
                    status = :status
                WHERE
                    uuid = :uuid;
                    
            SELECT * FROM device_management.devices WHERE devices.uuid = :uuid;`
            }

const deleteDevicesQuery = () => `DELETE FROM device_management.devices WHERE uuid = :uuid;`

export { getDevicesQuery, countDevicesQuery, insertDevicesQuery, modifyDevicesQuery, deleteDevicesQuery }