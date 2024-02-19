import mysql from 'mysql2'

const mysqlAdapter = () => {
	const start = config =>
		mysql.createPool(
			Object.assign({}, config.db, {
				multipleStatements: true,
				waitForConnections: true,
				connectionLimit: 10,
				queueLimit: 0, // unlimited queueing
				idleTimeout: 120000 // idle connections timeout, in milliseconds, the default value 60000
			})
		)
	const end = conn => conn.end()

	const execute = (query, pool, params) => {
		return new Promise(function (resolve, reject) {
			if (!query || query.trim().length === 0) {
				reject('No query provided')
			} else {
				pool.getConnection((err, conn) => {
					if (err) {
						reject(err)
					} else {
						conn.config.queryFormat = function (query2, values) {
							if (!values) return query2
							return query2.replace(
								/\:(\w+)/g,
								function (txt, key) {
									if (values.hasOwnProperty(key)) {
										return this.escape(values[key])
									}
									return txt
								}.bind(this)
							)
						}

						conn.query(query, params, function (err, result) {
							if (err) {
								console.log('##### QUERY FAILED: #####')
								console.log(query)
								console.log('##### REASON: #####')
								console.log(err)
								reject(err)
							} else {
								resolve(result)
							}
							conn.destroy()
						})
					}
				})
			}
		})
	}

	const beginTransaction = conn =>
		new Promise((resolve, reject) => {
			conn.beginTransaction(err => {
				if (err) {
					reject(err)
				}
				resolve(conn)
			})
		})

	const commit = conn =>
		new Promise((resolve, reject) => {
			conn.commit(err => {
				if (err) {
					reject(err)
				}
				resolve(conn)
			})
		})

	return { start, end, execute, beginTransaction, commit }
}

export default mysqlAdapter()
