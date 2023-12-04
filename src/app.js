import { createCluster, createClient } from 'redis';
const KEYS =  ['abc:1', 'key:1', '{xyz:}1'];
const SET = 'cluster_test.set';

async function reTest() {
    const client = createClient({url: `redis://default:redis@localhost:12000`});
    client.on('error', (err) => console.error(err));
    await client.connect();

    console.log('\n*** RE Write Tests ***');
    for (let key of KEYS) {
        console.log(`*** SET ${key}***`);
        let response = await client.sendCommand(['TFCALLASYNC', SET, '0', key]);
        console.log(`response: ${response}`);
    }
    await client.disconnect()
}

async function ossTest() {
    const cluster = createCluster({
        rootNodes: [
            { url: 'redis://192.168.20.2:13000' },
            { url: 'redis://192.168.20.3:13000' },
            { url: 'redis://192.168.20.4:13000' }
        ],
        defaults: {
            username: 'default',
            password: 'redis'
        }
    });
    cluster.on('error', (err) => console.error(err));
    await cluster.connect();
    
    console.log('\n*** OSS Write Tests ***');
    for (let key of KEYS) {
        console.log(`*** SET ${key}***`);
        let response = await cluster.sendCommand(key, false, 
        ['TFCALLASYNC', SET, '0', key]);
        console.log(`response: ${response}`);
    }
    await cluster.disconnect()
}

(async () => {
    await reTest();
    await ossTest();
})();