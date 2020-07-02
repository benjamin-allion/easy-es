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

    /**
     * Try to create a new ES index
     * @param indexName
     */
    createIndex(indexName) {
        this.client.indices.create({
            index: indexName
        }, function (error, response, status) {
            if (error) {
                throw new Error(`[ElasticService][createIndex] Index creation failed : ${error}`)
            } else {
                return response;
            }
        });
    }

    /**
     * Add new data to specified ES Index
     * @param {string} indexName
     * @param {number} id
     * @param {string} type
     * @param {object} data
     */
    addDocumentToIndex(indexName, id, type, data){
        this.client.index({
            index: indexName,
            id,
            type,
            body: data
        }, function(error, response, status) {
            if (error) {
                throw new Error(`[ElasticService][createIndex] Document injection failed : ${err}`)
            } else {
                return response;
            }
        });
    }
}
