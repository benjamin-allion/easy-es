const elasticsearch = require('elasticsearch');
const REQUEST_TIMEOUT = 30000 // 30s

class ElasticService {

    constructor(hosts) {
        this.client = new elasticsearch.Client({ hosts });
        this.pingServer()
    }

    /**
     * Method that ping ES Server and return if connection is ok or not
     */
    pingServer() {
        this.client.ping({
            requestTimeout: REQUEST_TIMEOUT,
        }, function (error) {
            if (error) {
                throw new Error('Elasticsearch cluster is down!')
            } else {
                console.log('Everything is ok');
                return true;
            }
        });
    }

}