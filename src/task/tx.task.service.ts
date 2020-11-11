import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '../logger'
import {
    getReqContextIdWithReqId,
    getReqContextIdFromEvents,
    getServiceNameFromMsgs, 
    getConsumerFromMsgs,
    getRequestIdFromMsgs,
    getReqContextIdFromMsgs,
    getCtxKey
} from '../helper/tx.helper';
import { IExFieldQuery, ITxStruct } from '../types/schemaTypes/tx.interface';
import { IExFieldTx } from '../types/tx.interface';
import { TxType } from '../constant';

@Injectable()
export class TxTaskService {
    constructor(@InjectModel('Tx') private txModel: any) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void>{
        let callServiceTxMap:object = {};//将要请求call_service tx map
        let callContextIds = new Set();
        let respondServiceTxData = await this.txModel.findAllServiceTx();
        //不需要查询callService tx 的数据组装
        respondServiceTxData.forEach((item:IExFieldTx)=>{
            switch(item.type){
                case TxType.respond_service:{
                    let reqContextId:string = getReqContextIdWithReqId(getRequestIdFromMsgs(item.msgs) || '').toUpperCase();
                    if (reqContextId && reqContextId.length) {
                        callServiceTxMap[getCtxKey(reqContextId, item.type)] = item;
                        callContextIds.add(reqContextId);
                    }
                }
                break;
                case TxType.pause_request_context:
                case TxType.start_request_context:
                case TxType.kill_request_context:
                case TxType.update_request_context:{
                    let reqContextId:string = (getReqContextIdFromMsgs(item.msgs) || '').toUpperCase();
                    if (reqContextId && reqContextId.length) {
                        callServiceTxMap[getCtxKey(reqContextId, item.type)] = item;
                        callContextIds.add(reqContextId.toUpperCase());
                    }
                }
                break;
                case TxType.bind_service:
                case TxType.define_service:
                case TxType.call_service:
                case TxType.update_service_binding:
                case TxType.disable_service_binding:
                case TxType.enable_service_binding:
                case TxType.refund_service_deposit:{
                    let ex_service_name = getServiceNameFromMsgs(item.msgs);
                    if (ex_service_name && ex_service_name.length) {
                        item.ex_service_name = ex_service_name;
                    }
                }
                break;
                default:
                break;
            }
        });

        let callServiceTxs = await this.txModel.findCallServiceTxWithReqContextIds(Array.from(callContextIds));
        //需要查询callService tx 的数据组装
        callServiceTxs.forEach((item:ITxStruct)=>{
            let serviceName = getServiceNameFromMsgs(item.msgs);
            const consumer: string = getConsumerFromMsgs(item.msgs);
            let reqContextId = getReqContextIdFromEvents(item.events);
            let callTypes = [
                getCtxKey(reqContextId, TxType.respond_service),
                getCtxKey(reqContextId, TxType.pause_request_context),
                getCtxKey(reqContextId, TxType.start_request_context),
                getCtxKey(reqContextId, TxType.kill_request_context),
                getCtxKey(reqContextId, TxType.update_request_context)
            ];
            callTypes.forEach((key)=>{
                let resTx:IExFieldTx = callServiceTxMap[key];
                if (resTx) {
                    resTx.ex_service_name = serviceName;
                    if (key == getCtxKey(reqContextId, TxType.respond_service)) {
                        resTx.ex_call_hash = item.tx_hash
                        resTx.ex_consumer = consumer;
                        resTx.ex_request_context_id = reqContextId;
                    }
                }
            });
        });

        //更新到数据库
        respondServiceTxData.forEach(async (item:IExFieldTx)=>{
            let exFieldQuery:IExFieldQuery = {hash:item.tx_hash};
            if (item.type == TxType.bind_service) {
                const res: ITxStruct = await this.txModel.queryDefineServiceTxHashByServiceName(getServiceNameFromMsgs(item.msgs));
                if (res && res.tx_hash && res.tx_hash.length) {
                   let subExFieldQuery: IExFieldQuery = {
                        hash: res.tx_hash,
                        bind: 1,
                    };
                    this.txModel.addExFieldForServiceTx(subExFieldQuery); 
                }
            }
            exFieldQuery.serviceName = item.ex_service_name;
            exFieldQuery.requestContextId = item.ex_request_context_id;
            exFieldQuery.consumer = item.ex_consumer;
            exFieldQuery.callHash = item.ex_call_hash;
            this.txModel.addExFieldForServiceTx(exFieldQuery);
        });
    }

//     async doTask(): Promise<void>{
//         //查询所有关于service的交易
//         let txList: ITxStruct[] = await this.txModel.findAllServiceTx();
//         //await this.syncRespondServiceTxServiceName();
//         for(let tx of txList){
//             if(
//                 tx.type === TxType.pause_request_context ||
//                 tx.type === TxType.start_request_context ||
//                 tx.type === TxType.kill_request_context ||
//                 tx.type === TxType.update_request_context
//             ){
//                 const serviceTx: any = await this.queryServiceName(tx);
//                 const serviceName = serviceTx.msgs[0].msg.service_name;
//                 let exFieldQuery: IExFieldQuery = {
//                     hash: tx.tx_hash,
//                     serviceName,
//                 };
//                 //在msg结构中加上ex:{service_name:""}
//                 await this.txModel.addExFieldForServiceTx(exFieldQuery);
//             }else if(tx.type === TxType.bind_service){
//                 let exFieldQuery: IExFieldQuery = {
//                     hash: tx.tx_hash,
//                     serviceName:(tx as any).msgs[0].msg.service_name,
//                 };
//                 //在msg结构中加上ex:{service_name:""}
//                 await this.txModel.addExFieldForServiceTx(exFieldQuery);
//                 const res: ITxStruct = await this.queryDefineServiceTxHashByServiceName((tx as any).msgs[0].msg.service_name);
//                 let subExFieldQuery: IExFieldQuery = {
//                     hash: res.tx_hash,
//                     bind: 1,
//                 };
//                 await this.txModel.addExFieldForServiceTx(subExFieldQuery);
//             }else {
//                 let serviceName: string = '';
//                 if(tx.type === TxType.define_service){
//                     serviceName = (tx as any).msgs[0].msg.name
//                 }else {
//                     serviceName = (tx as any).msgs[0].msg.service_name
//                 }
//                 let exFieldQuery: IExFieldQuery = {
//                     hash: tx.tx_hash,
//                     serviceName,
//                 };
//                 //在msg结构中加上ex:{service_name:""}
//                 await this.txModel.addExFieldForServiceTx(exFieldQuery);
//             }
//         }



//     }

//     async queryServiceName(tx: ITxStruct): Promise<string>{
//         return await this.txModel.queryServiceName((tx as any).msgs[0].msg.request_context_id);

//     }

//     async queryDefineServiceTxHashByServiceName(serviceName: string): Promise<ITxStruct>{
//         return await this.txModel.queryDefineServiceTxHashByServiceName(serviceName);

//     }
}

