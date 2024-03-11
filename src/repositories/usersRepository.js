import { pagination } from '../utils/pagination.js'


const _getUsersQuery = (_pagination = '') => ({ count }) => (params) => {
    const uuidCondition = params.uuid ? `and uuid like '%${params.uuid}%' ` : ''
    const usernameCondition = params.username ? `and username like '%${params.username}%'` : ''
    const passwordCondition = params.password ? `and password like '%${params.password}%'` : ''
    const nameCondition = params.name ? `and name  like '%${params.name }%'` : ''
    const emailCondition = params.email ? `and email like '%${params.email}%'` : ''
    const roleCondition = params.role ? `and role like '%${params.role}%'` : ''
    const bioCondition = params.bio ? `and bio like '%${params.bio}%'` : ''
    const avatarCondition = params.avatar ? `and avatar like '%${params.avatar}%'` : ''

    return `SELECT 
    ${count || `*`}
    FROM device_management.users
        WHERE 1=1

        ${uuidCondition}
        ${usernameCondition}
        ${passwordCondition}
        ${nameCondition}
        ${emailCondition}
        ${roleCondition}
        ${bioCondition}
        ${avatarCondition}

        ${_pagination}
        
    ;`
}
                                
const getUsersQuery = ({ limit, page, ...rest }) => _getUsersQuery(pagination({ limit, page }))({ count: false })(rest)

const countUsersQuery = (rest) => _getUsersQuery()({ count: 'COUNT(*) AS count' })(rest)

const insertUsersQuery = () => {
    return `INSERT INTO device_management.users (
            uuid,
            username, 
            password, 
            name, 
            email, 
            role, 
            bio
        ) VALUES (
            :uuid,
            :username, 
            :password, 
            :name, 
            :email, 
            :role, 
            :bio
        );

        SELECT * FROM device_management.users WHERE users.uuid = :uuid;`
}

const modifyUsersQuery = (params) => {
    const usernameCondition = params.username ? 'username = :username,' : ''
    const passwordCondition = params.password ? 'password = :password,' : ''
    const nameCondition = params.name ? 'name = :name,' : ''
    const emailCondition = params.email ? 'email = :email,' : ''
    const roleCondition = params.role ? 'role = :role,' : ''
    const bioCondition = params.bio ? 'bio = :bio,' : ''
    const avatarCondition = params.avatar ? 'avatar = :avatar,' : ''

    return `UPDATE device_management.users
                SET
                    ${usernameCondition}
                    ${passwordCondition}
                    ${nameCondition}
                    ${emailCondition}
                    ${roleCondition}
                    ${bioCondition}
                    ${avatarCondition}
                    uuid = :uuid
                WHERE
                    uuid = :uuid;
                    
            SELECT * FROM device_management.users WHERE users.uuid = :uuid;`
            }

const deleteUsersQuery = () => `DELETE FROM device_management.users WHERE uuid = :uuid;`

export { getUsersQuery, countUsersQuery, insertUsersQuery, modifyUsersQuery, deleteUsersQuery }