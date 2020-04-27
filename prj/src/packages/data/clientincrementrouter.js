import { models } from './models.js';
import { servicemodels } from './servicemodels.js';

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
            let itemModel = await servicemodels.UsersModel(this.item);
            if(itemModel == undefined)
            {
              return;
            }
            let userInfoModel = itemModel[0];
            let userinfos = await (await models.UserInfo).find({
                user_id: userInfoModel.user_id
            })
            if(userinfos.length == 0)
            {
                itemModel.save();
                return;
            }
            let findUserInfo = userinfos[0];
            findUserInfo.values = userInfoModel.values;
            findUserInfo.save();
            /*
            let userEmailModel = itemModel[1];
            let userAddressModel = itemModel[2];
            
            let userPhoneModel = itemModel[3];
    
            let userImModel = itemModel[4];
            */
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
        if(this.name == "updateDepartment"){
            let itemModel = await servicemodels.DepartmentsModel(this.item);
            if(itemModel == undefined)
            {
              return;
            }
            let departmentModel = itemModel[0];
            let departments = await (await models.Department).find({
                department_id: departmentModel.department_id
            })
            if(departments.length == 0)
            {
                departmentModel.save();
                return;
            }
            let findDepartment = departments[0];
            findDepartment.values = departmentModel.values;
            findDepartment.save();
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