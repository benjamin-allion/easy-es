const { Client } = require('@elastic/elasticsearch');
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_INDEX = 'default_index_2'

const RequestTypes = {
    MATCH_REQUEST: 0
}

class ElasticService {

    constructor(hosts) {
        this.client = new Client({node: hosts});
    }

    /**
     * Ping & Init ES Server
     * @returns {Promise<void>}
     */
    async init() {
        await this.pingServer();
        await this.createDefaultIndex();
    }

    /**
     * Method that ping ES Server and return if connection is ok or not
     */
    async pingServer() {
        try {
            await this.client.ping();
            console.log('Elasticsearch connection established.');
        } catch (exception) {
            throw new Error('Elasticsearch cluster is down!')
        }
    }

    /**
     * Try to create default index, do nothing if already exists
     */
    async createDefaultIndex(){
        try {
            await this.createIndex()
        } catch (error){
            console.log(error)
            // Do Nothing
        }
    }

    /**
     * Try to create a new ES index
     * @param indexName
     */
    async createIndex(indexName = DEFAULT_INDEX) {
        try {
          await this.client.indices.create({
              index: indexName
          });
          console.log(`[ElasticService][createIndex] '${indexName}' index creation done.`);
        } catch (error){
            throw new Error(`[ElasticService][createIndex] Index creation failed : ${error}`);
        }
    }

    /**
     * Add new data to specified ES Index
     * @param {string} indexName
     * @param {number} id
     * @param {string} type
     * @param {object} data
     */
    addDocumentToIndex(
        {
            indexName = DEFAULT_INDEX,
            id,
            data
        }) {
        this.client.index({
            index: indexName,
            id,
            body: data
        }, function (error, response, status) {
            if (error) {
                throw new Error(`[ElasticService][createIndex] Document injection failed : ${error}`)
            } else {
                return response;
            }
        });
    }

    /**
     * Do a search based on request options.
     * @param {string} indexName
     * @param {number} requestType
     * @param {object} fields
     * @param {number} start
     * @param {number} end
     */
    async search(
        {
            indexName = DEFAULT_INDEX,
            requestType = RequestTypes.MATCH_REQUEST,
            fields = {},
            pagination= {
                start: 0,
                end: DEFAULT_PAGE_SIZE
            }
        }) {
        const request = this.getRequest(arguments[0]);
        const results = await this.client.search({
            index: indexName,
            body: request
        })
        return results.body.hits.hits;
    }

    /**
     * Get ElasticSearch Request from request options.
     * @param {number} requestType
     * @param {object} fields
     * @param {number} start
     * @param {number} end
     * @returns {object}
     */
    getRequest(
        {
            requestType = RequestTypes.MATCH_REQUEST,
            fields = {},
            pagination = {
                start: 0,
                end: DEFAULT_PAGE_SIZE
            },
        }) {
        switch (requestType) {
            default: {
                return {
                    from: pagination.start,
                    size: pagination.end,
                    query: {
                        match: fields
                    }
                }
            }
        }
    }
}

module.exports = {
    ElasticService,
    RequestTypes
}
