import { Router } from 'express'
import config from "../config/index.js";
import {getDispositivesController} from "../controllers/dispositivesController.js"

export default (app) => {
    const routes = Router();

    routes.get('/', (req, res) => {
        res.send('Server up!');
    });
        
    routes.get('/dispositives',(config,req, res) => {
        const result = getDispositivesController(config,req, res)
        // res.send(result + '   Sample dispositives!');
    });

    routes.listen( () => {
        console.log(`Server is running on port `);
    });

}