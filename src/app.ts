import bodyParser from 'body-parser';
import express from 'express';
import methodOverride from 'method-override';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import './controllers/users';
import { RegisterRoutes } from './routes/routes';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

const swaggerOptions = {
    swaggerUrl: '/static/swagger.json'
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, swaggerOptions));
app.use('/static', express.static(path.join(__dirname, 'public')));

RegisterRoutes(app);

export default app;