process.env.MONGO_URL = 'mongodb+srv://user:Qaz123wsx@vision-erp-dev.hjg3g.mongodb.net/vision-dev-db?retryWrites=true&w=majority';
process.env.NODE_ENV = 'production';


const { getDBName, connect, getCollection, newConnection, getClient } = require('./');

async function main() {
await connect();
}

main().catch(console.error);