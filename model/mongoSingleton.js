const { MongoClient } = require('mongodb');

class MongoSingleton {
    constructor() {
        const uri = "mongodb+srv://stol:drbirds@stol-8lwdg.mongodb.net/test?retryWrites=true&w=majority";
        this.client = new MongoClient(uri, { useUnifiedTopology: true });
    }
    async init() {
        await this.client.connect();
        console.log('connected');

        this.db = this.client.db('Stol');
        this.usersDB = this.db.collection('users');
        this.filesDB = this.db.collection('files');
        this.filePartsDB = this.db.collection('fileParts')
    }
}

module.exports = new MongoSingleton();

process.on('SIGINT', function() {
    client.close(function() {
        console.log('MongoDB disconnected on app termination');
        process.exit(0);
    });
});