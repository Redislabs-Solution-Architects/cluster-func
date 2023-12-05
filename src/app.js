import { createCluster, createClient } from 'redis';
const KEYS =  ['abc:1', 'key:1', '{xyz:}1'];
const SET = 'cluster_test.set';
const GET = 'cluster_test.get';

async function reTest() {
    const client = createClient({url: `redis://default:redis@localhost:12000`});
    client.on('error', (err) => console.error(err));
    await client.connect();

    let i = 1
    console.log('\n*** RE Write Tests ***');
    for (let key of KEYS) {
        console.log(`*** SET ${key} ***`);
        let response = await client.sendCommand(['TFCALLASYNC', SET, '1', key, `val:${i}`]);
        console.log(`response: ${response}`);
        i++;
    }

    console.log('\n*** RE Read Tests ***');
    for (let key of KEYS) {
        console.log(`*** GET ${key} ***`);
        let response = await client.sendCommand(['TFCALLASYNC', GET, '1', key]);
        console.log(`response: ${response}`);
    }

    await client.disconnect();
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
    
    let i = 1;
    console.log('\n*** OSS Cluster API Write Tests ***');
    for (let key of KEYS) {
        console.log(`*** SET ${key} ***`);
        let response = await cluster.sendCommand(key, false, 
        ['TFCALLASYNC', SET, '0', key, `val:${i}`]);
        console.log(`response: ${response}`);
        i++;
    }

    console.log('\n*** OSS Cluster API Read Tests ***');
    for (let key of KEYS) {
        console.log(`*** GET ${key} ***`);
        let response = await cluster.sendCommand(key, false, 
        ['TFCALLASYNC', GET, '0', key]);
        console.log(`response: ${response}`);
    }

    await cluster.disconnect();
}

(async () => {
    await reTest();
    await ossTest();
})();