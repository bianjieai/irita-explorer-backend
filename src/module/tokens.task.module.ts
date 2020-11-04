import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {TokensSchema} from "../schema/tokens.schema";
import {TokensTaskService} from "../task/tokens.service";
import {TokensHttp} from "../http/lcd/tokens.http";
import {ParametersSchema} from "../schema/parameters.schema";
import {ParametersTaskService} from "../task/parameters.task.service";
import {StakingHttp} from "../http/lcd/staking.http";
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'Tokens',
                schema: TokensSchema,
                collection:'ex_tokens'
            },
            {
                name:'ParametersTask',
                schema: ParametersSchema,
                collection:'ex_sync_parameters'
            }
        ])
    ],
    providers:[TokensTaskService,StakingHttp,TokensHttp,ParametersTaskService],
    exports: [TokensTaskService,]
})
export class TokensModule{}