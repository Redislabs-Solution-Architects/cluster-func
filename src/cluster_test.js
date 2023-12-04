#!js api_version=1.0 name=cluster_test

import { redis } from '@redis/gears-api';
BigInt.prototype.toJSON = function() { return this.toString(); };

redis.registerAsyncFunction('set', async (asyncClient, arg1) => {
    redis.log('function cluster_test.set: ' + arg1);
    let response;
    let cmd = `SET ${arg1} foo`;
    asyncClient.block((c) => {
        response = c.call(...cmd.split(' '));
        redis.log(`set: ${response}`);
    });
    return response;
});

redis.registerAsyncFunction('get', async (asyncClient, arg1) => {
    redis.log('function cluster_test.set: ' + arg1);
    let response;
    let cmd = `GET ${arg1}`;
    asyncClient.block((c) => {
        response = c.call(...cmd.split(' '));
        redis.log(`get: ${response}`);
    });
    return response;
});