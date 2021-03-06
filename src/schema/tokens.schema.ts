import * as mongoose from 'mongoose';
import {ITokens} from "../types/schemaTypes/tokens.interface";
import { IAssetStruct } from '../types/schemaTypes/asset.interface';
import {SRC_PROTOCOL} from '../constant';

export const TokensSchema = new mongoose.Schema({
    symbol: String,
    denom: String,
    scale: String,
    is_main_token: Boolean,
    initial_supply: String,
    max_supply: String,
    mintable: Boolean,
    owner: String,
    name: String,
    total_supply: String,
    update_block_height: Number,
    src_protocol: String,
    chain:String,
})
//TokensSchema.index({symbol: 1}, {unique: true})
TokensSchema.index({denom: 1, chain:1}, {unique: true})

TokensSchema.statics = {
    async insertTokens(Tokens: ITokens) {
        //设置 options 查询不到就插入操作
        let {denom} = Tokens
        const options = {upsert: true, new: false, setDefaultsOnInsert: true}
        await this.findOneAndUpdate({ denom }, Tokens, options)
    },
    async queryAllTokens() {
        return await this.find({})
    },
    async queryMainToken() {
        return await this.findOne({is_main_token:true});
    },
    async findList(pageNum: number, pageSize: number): Promise<IAssetStruct[]> {
        return await this.find({'is_main_token':false, 'src_protocol':SRC_PROTOCOL.NATIVE})
            .select({
                symbol: 1,
                owner: 1,
                total_supply: 1,
                initial_supply: 1,
                max_supply: 1,
                mintable: 1,
                src_protocol:1,
                chain:1,
            })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize).exec();
    },
    async findCount(): Promise<number> {
        return await this.find({'is_main_token':false}).countDocuments().exec();
    },
    async findOneBySymbol(symbol: string): Promise<IAssetStruct | null> {
        return await this.findOne({ symbol }).select({
            name: 1,
            owner: 1,
            total_supply: 1,
            initial_supply: 1,
            max_supply: 1,
            mintable: 1,
            scale: 1,
            denom:1,
            src_protocol:1,
            chain:1,
        });
    },
}
