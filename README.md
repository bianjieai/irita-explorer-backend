## Description

<p align="center">IRITA service end</p>

## For Developer
写查询语句的时候, 特别是sync_tx, ex_sync_nft表, 查询字段以及index需要随时维护:
http://wiki.bianjie.ai/pages/viewpage.action?pageId=42960008

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# production mode
$ npm run start:prod
```
## Env Variables

### Db config
- DB_ADDR: `required` `string` db addr（example: `127.0.0.1:27017, 127.0.0.2:27017, ...`）
- DB_USER: `required` `string` db user（example: `user`）
- DB_PASSWD: `required` `string` db password（example: `DB_PASSWD`）
- DB_DATABASE：`required` `string` database name（example：`DB_DATABASE`）

### Server config

- LCD_ADDR: `required` `string`  lcd address（example: `http://192.168.150.32:2317`）

### Task config

- HEARTBEAT_RATE: `Optional` `number`  hearbeat rate for monitor（example: `10000`）
- DENOM_EXECUTE_TIME: `Optional`  execute time for denom pull（example: "01 * * * * *"）
- NFT_EXECUTE_TIME: `Optional`  execute time for nft pull（example: "21 * * * * *"）
- TX_SERVICE_NAME_EXECUTE_TIME: `Optional`  execute time for nft pull（example: "30 * * * * *"）
- FAULT_TOLERANCE_EXECUTE_TIME: `Optional` `string`  execute time for fault tolerance（example: "41 * * * * *"）
- SYNC_TX_SERVICE_NAME_SIZE: `Optional` `number`  execute time for fault tolerance（example: "100"）
- INCREASE_HEIGHT `Optional` `number` increase height for sync nft (default 1000)
- MAX_OPERATE_TX_COUNT `Optional` `number` limit operate tx count (default 100)
### log configure
- DisableLog: `Optional` `string` disable Log `true/false`
