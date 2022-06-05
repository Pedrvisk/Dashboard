const { resolve } = require('path');

// Plugin: RESTApi
module.exports = async (express, app, router, axios) => {
    const cors = require('cors');
    app.use(cors({ credentials: true }));

    // RESTApi: Routers
    const { readdirSync } = require('fs');
    const routes = readdirSync(resolve('src/Resources/ServerAPI')).filter((file) => file.endsWith('.js')).map((file) => file.split('.')[0]);;
    for (const route of routes)
        require(resolve(`src/Resources/ServerAPI/${route}`))(express, app, router, axios);

    // RESTApi: Net-ipc Server
    const { Client } = require('net-ipc');
    app.client = new Client({
        host: '150.230.94.154',
        port: 3000,
        tls: true,
        options: {
            pskCallback: () => {
                return {
                    identity: process.env.USER,
                    psk: Buffer.from(process.env.PASS)
                }
            },
            ciphers: 'PSK',
            checkServerIdentity: () => void 0
        }
    });

    app.client.connect().catch(console.error);

    // RESTApi: Main 
    router.get('/api', async (req, res) => {
        try {
            return res.json({ statusCode: 200, statusText: 'Miuky API Online!' })
        } catch (err) {
            return res.json({ statusCode: 503, statusText: 'Miuky API Offline!' })
        }
    });

    // RESTApi: Handler Error
    router.use('/api', (req, res) => {
        return res.status(404).json({ statusCode: 404, statusText: 'Endpoint not found.' })
    });

}