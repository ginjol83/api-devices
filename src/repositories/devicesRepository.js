const getDevicesQuery = (conn) => "SELECT * FROM device_management.devices;"

//const countDevicesQuery = (rest) => _devicesQuery()({ count: 'COUNT(*) AS count' })(rest)

const insertDevicesQuery = ({id,name,type,brand,model,registration_date,status}) => {
    const idCondition = id
    const nameCondition = name
    const typeCondition = type
    const brandCondition = brand
    const modelCondition = model
    const registrationDateCondition = registration_date
    const statusCondition = status

    `INSERT INTO device_management.devices (
        id,
        name,
        type,
        brand,
        model,
        registration_date,
        status 
        ) VALUES (
            ${idCondition},
            ${nameCondition},
            ${typeCondition},
            ${brandCondition},
            ${modelCondition},
            ${registrationDateCondition},
            ${statusCondition}
        );`
}

const modifyDevicesQuery = (conn) => "SELECT * FROM device_management.devices;"

const deleteDevicesQuery = (conn) => "SELECT * FROM device_management.devices;"



export { getDevicesQuery, /*countDevicesQuery,*/ insertDevicesQuery, modifyDevicesQuery, deleteDevicesQuery }