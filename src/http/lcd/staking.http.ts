import {HttpService, Injectable} from '@nestjs/common';
import {cfg} from '../../config/config';
import {Logger} from '../../logger';
import {
    AddressBalancesLcdDto,
    IconUriLcdDto,
    StakingValidatorDelegationLcdDto,
    StakingValidatorLcdDto, StakingValidatorParametersLcdDto,
    StakingValidatorSlashLcdDto, StakingValUnBondingDelLcdDto,
    DelegatorsDelegationLcdDto,
    DelegatorsUndelegationLcdDto
} from "../../dto/http.dto";


@Injectable()

export class StakingHttp {
    async queryValidatorListFromLcd(pageNum: number, pageSize: number) {
        const validatorLcdUri = `${cfg.serverCfg.lcdAddr}/staking/validators?pageNum=${pageNum}&pageSize=${pageSize}`
        try {
            const stakingValidatorData: any = await new HttpService().get(validatorLcdUri).toPromise().then(result => result.data)
            if (stakingValidatorData && stakingValidatorData.result) {
                return StakingValidatorLcdDto.bundleData(stakingValidatorData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${validatorLcdUri}`, e)
        }
    }

    async queryValidatorFormSlashing(validatorPubkey: string) {
        const slashValidatorUri = `${cfg.serverCfg.lcdAddr}/slashing/validators/${validatorPubkey}/signing_info`
        try {
            const stakingSlashValidatorData: any = await new HttpService().get(slashValidatorUri).toPromise().then(result => result.data)
            if (stakingSlashValidatorData && stakingSlashValidatorData.result) {
                return new StakingValidatorSlashLcdDto(stakingSlashValidatorData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${slashValidatorUri}`, e)
        }
    }

    async querySelfBondFromLcd(valOperatorAddr) {
        const selfBondUri = `${cfg.serverCfg.lcdAddr}/staking/validators/${valOperatorAddr}/delegations`
        try {
            const selfBondData: any = await new HttpService().get(selfBondUri).toPromise().then(result => result.data)
            if (selfBondData && selfBondData.result) {
                return StakingValidatorDelegationLcdDto.bundleData(selfBondData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${selfBondUri}`, e)
        }
    }

    async queryValidatorIcon(valIdentity) {
        const getIconUri = `${cfg.serverCfg.iconUri}?fields=pictures&key_suffix=${valIdentity || ''}`
        try {
            const valIconData: any = await new HttpService().get(getIconUri).toPromise().then(result => result)
            if (valIconData) {
                return new IconUriLcdDto(valIconData)
            } else {
                Logger.warn('api-error:', 'there is no result of validators from getIconUri');
            }

        } catch (e) {
            Logger.warn(`api-error from ${getIconUri}`, e)
        }
    }

    async queryParametersFromSlashing() {
        const parameterUri = `${cfg.serverCfg.lcdAddr}/slashing/parameters`
        try {
            const parameterData: any = await new HttpService().get(parameterUri).toPromise().then(result => result.data)
            if (parameterData && parameterData.result) {
                return new StakingValidatorParametersLcdDto(parameterData.result)
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${parameterUri}`, e)
        }
    }

    async queryValidatorDelegationsFromLcd(address) {
        const getValidatorDelegationsUri = `${cfg.serverCfg.lcdAddr}/staking/validators/${address}/delegations`
        try {
            const validatorDelegationsData: any = await new HttpService().get(getValidatorDelegationsUri).toPromise().then(result => result.data)
            if (validatorDelegationsData && validatorDelegationsData.result) {
                return StakingValidatorDelegationLcdDto.bundleData(validatorDelegationsData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validator delegations from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${getValidatorDelegationsUri}`, e)
        }
    }

    async queryValidatorUnBondingDelegations(address) {
        const getValidatorUnBondingDelUri = `${cfg.serverCfg.lcdAddr}/staking/validators/${address}/unbonding_delegations`
        try {
            const validatorUnBondingDelegationsData: any = await new HttpService().get(getValidatorUnBondingDelUri).toPromise().then(result => result.data)
            if (validatorUnBondingDelegationsData && validatorUnBondingDelegationsData.result) {
                return StakingValUnBondingDelLcdDto.bundleData(validatorUnBondingDelegationsData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validator unBonding delegations from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${getValidatorUnBondingDelUri}`, e)
        }
    }

    async queryBalanceByAddress(address) {
        const getBalancesUri = `${cfg.serverCfg.lcdAddr}/bank/balances/${address}`
        try {
            const addressBalancesData: any = await new HttpService().get(getBalancesUri).toPromise().then(result => result.data)
            if (addressBalancesData && addressBalancesData.result) {
                return AddressBalancesLcdDto.bundleData(addressBalancesData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validator unBonding delegations from lcd');
            }

        } catch (e) {
            console.log(e)
            Logger.warn(`api-error from ${getBalancesUri}`, e)
        }
    }

    async queryDelegatorsDelegationsFromLcd(address) {
        const getDelegatorsDelegationsUri = `${cfg.serverCfg.lcdAddr}/staking/delegators/${address}/delegations`
        try {
            const delegatorsDelegationsData: any = await new HttpService().get(getDelegatorsDelegationsUri).toPromise().then(result => result.data)
            if (delegatorsDelegationsData && delegatorsDelegationsData.result) {
                return new DelegatorsDelegationLcdDto(delegatorsDelegationsData);
            } else {
                Logger.warn('api-error:', 'there is no result of delegators delegations from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${getDelegatorsDelegationsUri}`, e)
        }
    }

    async queryDelegatorsUndelegationsFromLcd(address) {
        const getDelegatorsUndelegationsUri = `${cfg.serverCfg.lcdAddr}/staking/delegators/${address}/unbonding_delegations`
        try {
            const delegatorsUndelegationsData: any = await new HttpService().get(getDelegatorsUndelegationsUri).toPromise().then(result => result.data)
            if (delegatorsUndelegationsData && delegatorsUndelegationsData.result) {
                return new DelegatorsUndelegationLcdDto(delegatorsUndelegationsData);
            } else {
                Logger.warn('api-error:', 'there is no result of delegators delegations from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${getDelegatorsUndelegationsUri}`, e)
        }
    }
}