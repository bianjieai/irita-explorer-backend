import * as mongoose from 'mongoose';
import {signedBlocksWindow} from "../constant";
import {IParameters} from "../types/schemaTypes/parameters.interface";

export const ParametersSchema = new mongoose.Schema({
    module: String,
    key: String,
    cur_value: String,
    create_time: Number,
    update_time: Number,
})

ParametersSchema.index({module:1,key: 1},{unique: true})

ParametersSchema.statics = {

    async insertParameters(Parameters:IParameters){
        await this.insertMany(Parameters,{ ordered: false })
    },

    async updateParameters(updateParameters:IParameters){
        const {cur_value,update_time} = updateParameters
        await this.updateOne({cur_value},{cur_value,update_time})
    },

    async queryAllParameters(){
        return await this.find({}).select({'_id':0,'__v':0})
    },

    async querySignedBlocksWindow(){
        return await this.findOne({key:signedBlocksWindow}).select({'_id':0,'__v':0})
    }
}