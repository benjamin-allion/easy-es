const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const {ElasticService} = require('./ElasticService');

const elasticSearchHosts = ['http://localhost:9200'];
const elasticService = new ElasticService(elasticSearchHosts);

(async () => {
    await elasticService.init();

    const app = express();
    app.use(bodyParser.json())
    app.set('port', process.env.PORT || 3001);

    // Set path to serve static files
    app.use(express.static(path.join(__dirname, 'public')));

    // Enable CORS
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // Search Route
    app.get('/search', async (req, res) => {
        const searchOptions = {
            fields: {
                name: 'DEMO'
            }
        }
        const searchResult = await elasticService.search(searchOptions);
        res.send(searchResult);
    })

    app.listen(app.get('port'), () => {
        console.log('Express server listening on port ' + app.get('port'));
    });
})();