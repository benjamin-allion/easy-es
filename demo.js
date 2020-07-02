const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const {ElasticService} = require('./ElasticService');

const elasticSearchHosts = ['http://localhost:9200'];
const elasticService = new ElasticService(elasticSearchHosts);

const demoItems = [{
    id: 123,
    firstName: 'DemoFirstName',
    lastName: 'DemoLastName',
    phone: '0651000001'
}];

const mappings = [
    {
        "type_1": {
            "_all": {"enabled": true},
            "properties": {
                "firstName": {"type": "string"},
                "phone": {
                    "type": "number"
                }
            }
        },
        "type_2": {
            "properties": {
                "firstName": {"type": "string"},
                "phone": {
                    "type": "number",
                    "analyzer":"phone_analyzer"
                }
            }
        }
    }
]

(async () => {
    await elasticService.init();
    await elasticService.addDocumentToIndex(demoItems[0].id, demoItems[0]);

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
                firstName: req.query.query
            }
        }
        const searchResult = await elasticService.search(searchOptions);
        res.send(searchResult);
    })

    app.listen(app.get('port'), () => {
        console.log('Express server listening on port ' + app.get('port'));
    });
})();
