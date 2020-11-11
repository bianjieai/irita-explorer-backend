import { Document } from 'mongoose';
import { IDenomStruct } from './denom.interface';
export interface IDeleteQuery {
    denom_id: string,
    nft_id: string,
}

export interface INftStruct {
    denom_id?: string,
    denom_name?: string,
    nft_id?: string,
    nft_name?: string,
    owner?: string,
    uri?: string,
    data?: string,
    last_block_height?: number,
    last_block_time?: number,
    create_time?: number,
    update_time?: number,
    hash?: string,
}
export interface INftCountQueryParams {
    denom_id?: string;
    nft_id?: string;
    owner?: string;
}

export interface INftDetailStruct extends INftStruct{
    denomDetail: IDenomStruct,
}

export interface INftListStruct extends INftStruct{
    denomDetail: IDenomStruct,
}

export interface INftMapStruct extends INftStruct{
    denom?: string,
    denom_name?: string,
    nft_id?: string,
    nft_name?: string,
}

export interface INft extends INftStruct,Document {

}

export interface INftListQueryParams {
    denom_id?: string;
    nft_id?: string;
    owner?: string;
}