import errorHandler from 'errorhandler';

import app from './app';
import config, { ServerEnvironment } from './config';

const serverConfig = config.get('server');

app.set('env', serverConfig.env);
app.set('port', serverConfig.port);
app.set('host', serverConfig.ip);

/**
 * Error Handler. Provides full stack - remove for production
 */
if (serverConfig.env !== ServerEnvironment.Production ) {
    app.use(errorHandler());
}

const server = app.listen(app.get('port'), app.get('host'), () => {
    console.log(
        '\tApp is running at http://%s:%d in %s mode',
        app.get('host'),
        app.get('port'),
        app.get('env')
    );
    console.log('\tPress CTRL-C to stop\n');
});

export default server;