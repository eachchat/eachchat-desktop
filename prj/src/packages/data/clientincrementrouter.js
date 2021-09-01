import { models } from './models.js'
import { servicemodels } from './servicemodels.js'
import { UserInfo, Department } from './sqliteutil.js'
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
            await userInfoModel.save();

            let userEmailModel = itemModel[1];
            for(let index in userEmailModel){
                await userEmailModel[index].save();
            }
            let userAddressModel = itemModel[2];
            await userAddressModel.save();
            
            let userPhoneModel = itemModel[3];
            for(let index in userPhoneModel){
                await userPhoneModel[index].save();
            }
            
            let userImModel = itemModel[4];
            await userImModel.save();
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
            if(this.item.del == 1)
            {
                await Department.DeleteDepartmentByID(this.item.id);
                return;
            }
            let itemModel = await servicemodels.DepartmentsModel(this.item);
            if(itemModel == undefined)
            {
              return;
            }
            let departmentModel = itemModel;
            let departments = await (await models.Department).find({
                department_id: departmentModel.department_id
            })

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