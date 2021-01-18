import { models } from './models.js'
import { servicemodels } from './servicemodels.js'
import { sqliteutil, Group, UserInfo } from './sqliteutil.js'
import * as fs from 'fs-extra'
//import { services } from '../../packages/data'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from './conf_service.js'
import {services} from './index.js';
import * as path from 'path'
class BaseIncrement{
    constructor(type, item, service){
        this.type = type;
        this.item = item;
        this.service = service;
    }
    async handler(){

    }
}

class UserIncrement extends BaseIncrement{
    constructor(type, item, service){
        super(type, item, service);
    }
    async handler(){
        if(this.type == "updateUser"){
            if(this.item.del == 1)
            {
                await UserInfo.DeleteUserByUserID(this.item.id);
                return;
            }
                
            let itemModel = await servicemodels.UsersModel(this.item);
            if(itemModel == undefined)
            {
              return;
            }
            let userInfoModel = itemModel[0];
            var foundUsers = await(await models.Login).find({
                $reverse: true
              });
            let userinfos = await (await models.UserInfo).find({
                user_id: userInfoModel.user_id
            })
            let updatetime;
            if(userinfos.length == 0)
            {
                updatetime = userInfoModel.updatetime;
                userInfoModel.save();
                return;
            }
            else{
                let findUserInfo = userinfos[0];
                findUserInfo.values = userInfoModel.values;
                findUserInfo.save();
            }
        }
        else{
            let increment = new DepartmentIncrement(this.type, this.item, this.service);
            await increment.handler();
        }
    }
}

class DepartmentIncrement extends BaseIncrement{
    constructor(type, item, service){
        super(type, item, service);
    }
    async handler(){
        if(this.type == "updateDepartment"){
            let itemModel = await servicemodels.DepartmentsModel(this.item);
            if(itemModel == undefined)
            {
              return;
            }
            let departmentModel = itemModel;
            let departments = await (await models.Department).find({
                department_id: departmentModel.department_id
            })
            if(departmentModel.del == 1)
                return;
            if(departments.length == 0)
            {
                departmentModel.save();
            }
            else{
                let findDepartment = departments[0];
                findDepartment.values = departmentModel.values;
                findDepartment.save();
            }
        }
        else{
            console.log("unknow clientIncrement:" + this.type);
        }
    }
}

async function clientIncrementRouter(type, item, service)
{
    let increment = new UserIncrement(type, item, service);
    await increment.handler();
}

export {
    clientIncrementRouter
}