import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NftHttp } from '../http/lcd/nft.http';
import { INft, INftStruct } from '../types/schemaTypes/nft.interface';
import { IDenom, IDenomStruct } from '../types/schemaTypes/denom.interface';
import md5 from 'blueimp-md5';
import { getTimestamp } from '../util/util';
import { ILcdNftStruct } from '../types/task.interface';
import { ITxStruct } from '../types/schemaTypes/tx.interface';
import { INCREASE_HEIGHT, MAX_OPERATE_TX_COUNT, TxType } from '../constant';

@Injectable()
export class NftTaskService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>,
                @InjectModel('Tx') private txModel: any,
                @InjectModel('Denom') private denomModel: any,
    ) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void> {
        const nftList: INftStruct[] = await (this.nftModel as any).queryLastBlockHeight();
        let lastBlockHeight = 0;
        if (nftList && nftList.length > 0) {
            lastBlockHeight = nftList[0].last_block_height;
        } else {
            lastBlockHeight = 0;
        }
        //查询最高区块, 当递加的高度超过最大交易height的时候, 需要停止查询
        let maxHeight = 0;
        const txList = await (this.txModel as any).queryMaxNftTxList();
        if (txList && txList.length > 0 && txList[0].height > 0) {
            maxHeight = txList[0].height;
        } else {
            //如果高度未查出, 会出现超出tx高度以后一直递加查询仍然达不到 所需要的交易的数量, 会陷入死循环, 需要直接抛出错误
            throw 'the max height of nft tx has not been queried!';
        }
        let nftTxList: ITxStruct[] = await this.getNftTxList(lastBlockHeight, maxHeight);
        if (nftTxList && nftTxList.length > 0) {
            const denomList: IDenomStruct[] = await (this.denomModel as any).findList(0, 0, '', 'true');
            let denomMap = new Map<string, string>();
            if (denomList && denomList.length > 0) {
                denomList.forEach((denom: IDenomStruct) => {
                    denomMap.set(denom.denom_id, denom.name);
                });
            }
            await this.handleNftTx(nftTxList, denomMap);
        }
    }

    async getNftTxList(lastBlockHeight: number, maxHeight: number): Promise<ITxStruct[]> {

        let list: any[] = [];
        const querynftTxList = async (lastBlockHeight: number) => {
            const nftTxList: ITxStruct[] = await this.queryNftTxList(lastBlockHeight);
            list = list.concat(nftTxList);
            console.log('tx list length:', list.length, 'last block height:', lastBlockHeight);
            if (list.length <= MAX_OPERATE_TX_COUNT) {
                lastBlockHeight += INCREASE_HEIGHT;
                if (lastBlockHeight <= maxHeight) {
                    await querynftTxList(lastBlockHeight);
                }
            }
        };
        await querynftTxList(lastBlockHeight);

        return list;
    }

    async queryNftTxList(lastBlockHeight: number): Promise<ITxStruct[]> {
        return await (this.txModel as any).queryNftTxList(lastBlockHeight);
    }

    async handleNftTx(nftTxList: ITxStruct[], denomMap: Map<string, string>): Promise<void> {
        return new Promise((resolve) => {
            const promiseList: Promise<any>[] = [];
            const nftObj = {};
            nftTxList.forEach((tx) => {
                const { msg } = (tx.msgs as any);
                const idStr = `${msg.denom}-${msg.id}`;
                if (!nftObj[idStr]) nftObj[idStr] = {};
                if ((tx.msgs as any).type === TxType.mint_nft) {
                    nftObj[idStr].denom_id = msg.denom;
                    nftObj[idStr].denom_name = denomMap.get(msg.denom);
                    nftObj[idStr].nft_id = msg.id;
                    nftObj[idStr].nft_name = msg.name;
                    nftObj[idStr].owner = msg.sender;
                    nftObj[idStr].uri = msg.uri;
                    nftObj[idStr].data = msg.data;
                    nftObj[idStr].is_deleted = false;
                } else if ((tx.msgs as any).type === TxType.edit_nft) {
                    nftObj[idStr].nft_name = msg.name;
                    nftObj[idStr].uri = msg.uri;
                    nftObj[idStr].data = msg.data;
                } else if ((tx.msgs as any).type === TxType.transfer_nft) {
                    nftObj[idStr].owner = msg.sender;
                } else if ((tx.msgs as any).type === TxType.burn_nft) {
                    nftObj[idStr].is_deleted = true;
                }
                nftObj[idStr].last_block_height = tx.height;
                nftObj[idStr].last_block_time = tx.time;
                nftObj[idStr].create_time = getTimestamp();
                nftObj[idStr].update_time = getTimestamp();
            });

            for (let idStr in nftObj) {
                if (nftObj[idStr].is_deleted) {
                    promiseList.push((this.nftModel as any).deleteNft(nftObj[idStr]));
                } else {
                    promiseList.push((this.nftModel as any).updateNft(nftObj[idStr]));
                }
            }
            Promise.all(promiseList).then(res => {
                if (res) {
                    console.log('Done!');
                    resolve();
                }
            });

        });
    }


}

