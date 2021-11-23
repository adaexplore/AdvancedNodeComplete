const mongoose =require('mongoose');
const redis=require('redis');
const util =require('util');
const keys=require('../config/keys');

const client =redis.createClient(keys.redisUrl);
client.hget=util.promisify(client.hget);
const exec=mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache=function (options={}) {
  
    this.useCache=true;
   
    this.hashkey=JSON.stringify(options.key||'');

    return this;    
};

mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) {
      return exec.apply(this, arguments);
    }
  
    const key = JSON.stringify(
       Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
      })
    );
  
    console.log(keys.redisUrl);
    // See if we have a value for 'key' in redis

     const cacheValue = await client.hget(this.hashkey, key);
  
    // If we do, return that
    if (cacheValue) {
      const doc = JSON.parse(cacheValue);
    
      console.log("SERVING FROM REDIS");
  
      return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(doc);
    }
  
 
    const result = await exec.apply(this, arguments);
  
    console.log("SERVING FROM MangoDB");
  
    client.hmset(this.hashkey, key, JSON.stringify(result), 'EX', 10);
  
    return result;
  };

  module.exports = {
    clearHash(hashKey) {

      console.log("Clean Cache.");
      client.del(JSON.stringify(hashKey));
    }
  };