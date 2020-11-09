import { models } from './models.js'
import { servicemodels } from './servicemodels.js'
import { sqliteutil, Group } from './sqliteutil.js'
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
                if(findUserInfo.avatar_t_url != userInfoModel.avatar_t_url){
                    
                    var userId = findUserInfo.user_id;
                    confservice.init(foundUsers[0].user_id);
                    console.log(findUserInfo.user_display_name + " url is changed");
                    console.log(findUserInfo.avatar_t_url + " avatar_t_url");
                    
                    var groupsTmp = await Group.SearchByNameKey(findUserInfo.user_display_name);
                    for(var i=0;i<groupsTmp.length;i++) {
                        if(groupsTmp[i].group_type == 102) {
                            console.log("get group from name is ", groupsTmp[i]);
                            var targetDir = confservice.getUserThumbHeadPath();
                            var targetPath = path.join(targetDir, groupsTmp[i].group_id + '.png');
                            if(fs.existsSync(targetPath)){
                                console.log("group target path is ", targetPath);
                                fs.unlink(targetPath, function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                });
                            }
                            await services.common.downloadGroupAvatar(findUserInfo.avatar_t_url, groupsTmp[i].group_id);
                            break;
                        }
                    }
                    
                    var localPath = confservice.getUserThumbHeadLocalPath(userId);
                    if(fs.existsSync(localPath)){
                        fs.unlink(localPath, function(err){
                            if(err){
                                console.log(err);
                            }
                        });
                    }
                    await services.common.downloadUserTAvatar(findUserInfo.avatar_t_url, findUserInfo.user_id);
                }
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
            sqliteutil.UpdateMaxDepartmentUpdatetime(this.service.data.selfuser.id, departmentModel.updatetime);
            this.service.data.login.department_max_updatetime = departmentModel.updatetime;

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