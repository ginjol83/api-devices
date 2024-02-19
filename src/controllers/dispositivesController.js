import { getDispositivesModel } from "../models/dispositivesModel.js"
import mysql from "../adapters/mysql.js"

const getDispositivesController = (config,req, res) => {
        const conn = mysql.start(config)        
        const result = mysql.execute(getDispositivesModel(conn),conn)
        result.then(result => {
            console.log(result)
        }).then(result => {
            console.log(result)
        }).finally(error => {
            console.log(error)
        })
    }
export { getDispositivesController }