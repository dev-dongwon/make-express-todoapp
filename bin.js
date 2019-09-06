require('dotenv').config()

const debug = require('./utils/debug')('bin');
const app = require('./app');

const hostname = process.env.HOST
const port = process.env.PORT || 3000;

app.listen(port, hostname, () => {
    debug(`Server running at http://${hostname}:${port}/`);
})