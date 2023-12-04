# Redis Triggers and functions write operations with OSS Cluster API

## Contents
1.  [Summary](#summary)
2.  [Architecture](#architecture)
3.  [Data Input](#datainput)
4.  [Features](#features)
5.  [Prerequisites](#prerequisites)
6.  [Installation](#installation)
7.  [Usage](#usage)
8.  [Results](#results)

## Summary <a name="summary"></a>
This is code demonstrates a workaround for the Trigger and function challenge with remote writes.  Using a Redis DB configured with OSS Cluster API support, writes can be directed to a local shard via the cluster client.  

## Architecture <a name="architecture"></a>
- Two databases each with 3 shards are created.  
- One database is enabled with the OSS Cluster API; the other is a proxy-based Redis Enterprise database.  
- A simple Redis function is deployed to each database.  That function performs a SET to a key passed as an argument.  - A Nodejs app is used to call that Redis function.  The app has 2 client connections: OSS cluster client to the OSS DB, and standard node-redis connection to the RE DB.
- Redis CLI is leveraged to view the databases' state after the app run.

![architecture](images/ClusterFunc_Arch_High.jpg) 

![rladmin](images/rladmin.png)

## Data Input <a name="datainput"></a>
Below shows the hash slot mapping for the three keys to be tested.  One key maps to each of the 3 shards (RE and OSS).
```bash
> cluster keyslot abc:1
(integer) 2336

> cluster keyslot key:1
(integer) 6657

> cluster keyslot {xyz:}1
(integer) 12708
```
## Features <a name="features"></a>
- Builds out a full RE environment with 3 nodes and 2 databases.  One DB is OSS Cluster enabled, the other standard RE.

## Prerequisites <a name="prerequisites"></a>
- Ubuntu 20.x
- Docker Compose
- Docker
- Valid Redis Enterprise license file that supports at least 6 shards

## Installation <a name="installation"></a>
```bash
git clone https://github.com/Redislabs-Solution-Architects/cluster-func.git && cd cluster-func && npm install
```

## Usage <a name="usage"></a>
### Start
```bash
./start.sh
```
### Stop
```bash
./stop.sh
```

## Results <a name="results"></a>
### app.js Output
All SETS appear to have executed successfully, but that is not true for the RE tests.  Only 1 of those SETS actually resulted in data being written to Redis.  
```bash
*** RE Write Tests ***
*** SET abc:1***
response: OK
*** SET key:1***
response: OK
*** SET {xyz:}1***
response: OK

*** OSS Write Tests ***
*** SET abc:1***
response: OK
*** SET key:1***
response: OK
*** SET {xyz:}1***
response: OK
```
### RE DB State
The app client was connected to RE shard 1 as such, the only write that was actually successful was for the key local to that shard - abc:1
```bash
./redis-cli --no-auth-warning -u redis://default:redis@localhost:12000 GET abc:1 
"foo"

./redis-cli --no-auth-warning -u redis://default:redis@localhost:12000 GET key:1 
(nil)

./redis-cli --no-auth-warning -u redis://default:redis@localhost:12000 GET {xyz:}1 
(nil)
```
### OSS DB State
All OSS-based SETs from the Redis function were successful.  The function call was wrapped in a OSS cluster API to ensure the write was performed on the shard for key's hashslot.
```bash
./redis-cli --no-auth-warning -u redis://default:redis@localhost:13000 -c GET abc:1 
"foo"

./redis-cli --no-auth-warning -u redis://default:redis@localhost:13000 -c GET key:1 
"foo"

./redis-cli --no-auth-warning -u redis://default:redis@localhost:13000 -c GET {xyz:}1 
"foo"
```