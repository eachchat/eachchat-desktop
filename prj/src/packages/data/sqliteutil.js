import { models, globalModels } from './models.js';
import { model } from '../core/index.js';
import { JsonMsgContentToString } from '../core/Utils.js';
var pinyin = require("pinyin");

const sqliteutil = {
    async GetMaxMsgSequenceID(userid){
        let groups = await(await models.User).find({
            id: userid
        });
        if(groups.length == 0)
        {
            return 0;
        }
        let item = groups[0];
        return item.msg_max_sequenceid;
    },

    async UpdateMaxMsgSequenceID(userid, sequenceid){
        var foundUsers = await(await models.User).find({
            id: userid
          });
        if(foundUsers.length == 0){
            return;
        }
        foundUsers[0].msg_max_sequenceid = sequenceid;
        foundUsers[0].save();
    },

    async GetMaxGroupUpdatetime(userid){
        let groups = await(await models.User).find({
            id: userid
        });
        if(groups.length == 0)
        {
            return 0;
        }
        let item = groups[0];
        return item.group_max_updatetime;
    },

    async UpdateGroupMaxUpdatetime(userid, updatetime){
        var foundUsers = await(await models.User).find({
            id: userid
          });
        if(foundUsers.length == 0){
            return;
        }
        foundUsers[0].group_max_updatetime = updatetime;
        foundUsers[0].save();
    },

    async UpdateMaxDepartmentUpdatetime(userid, updatetime){
        let foundUsers = await(await models.User).find({
            id: userid
          });
        if(foundUsers.length == 0){
            return;
        }
        foundUsers[0].department_max_updatetime = updatetime;
        foundUsers[0].save();
    },
    
    async ExistMsg(msgid){
        let msgs = await(await models.Message).find(
            {
                message_id: msgid
            }
        );
        if(msgs.length == 0){
            return false;
        }
        return true;
    },
    
    
    async ClearCollectionByType(type){
        let collections = await(await models.Collection).find(
            {
                collection_type: type
            }
        );
        for(let index in collections){
            collections[index].destroy();
        }
        
    },
    
    async ExistCollection(collectionId){
        let collections = await(await models.Collection).find(
            {
                collection_id: collectionId
            }
        );
        if(collections.length == 0){
            return false;
        }
        return true;
    },

    async DeleteItemFromCollectionByFavouriteID(favouriteID){
        let collections = await (await models.Collection).find({
            favourite_id: favouriteID
        });
        if(collections.length != 0){
            collections[0].destroy();
        }
    },

    async DeleteItemFromCollectionByCollectionIdID(collectionId){
        let collections = await (await models.Collection).find({
            collection_id: collectionId
        });
        if(collections.length != 0){
            collections.forEach(item=>{
                item.destroy();
            });
        }
    },

    async SetGroupMessageRead(groupID){
        let groups = await (await models.Groups).find({
            group_id: groupID
        });
        if(groups.length != 0){
            let group = groups[0]
            group.un_read_count = 0;
            group.save();
        }
    },

    async FindMaxSequenceIDFromGroup(){
        let groups = await(await models.Groups).find(
            {
                $order: {
                    by: 'sequence_id',
                    reverse: true
                    },
                $size: 1
            }
        );
        if(groups.length == 0)
            return 0;
        let sequenceID = groups[0].sequence_id;
        return sequenceID;
    },

    async UpdateGroupName(groupID, groupName){
        let groups = await (await models.Groups).find({
            group_id: groupID
        });
        if(groups.length != 0){
            let group = groups[0]
            group.group_name = groupName;
            group.save();
        }
    },

    async ClearMessageByGroupID(groupID){
        let msgs = await (await models.Message).find({
            group_id: groupID
        }); 
        if(msgs.length != 0){
            for(let item in msgs){
                msgs[item].destroy();
            }
        }
    },

    async DeleteGroupByGroupID(groupID){
        let groups = await (await models.Groups).find({
            group_id: groupID
        });
        if(groups.length != 0){
            groups[0].destroy();
        }
    },

    async UpdateGroupStatus(groupID, status){
        let groups = await (await models.Groups).find({
            group_id: groupID
        });
        if(groups.length != 0){
            let group = groups[0]
            group.status = status;
            group.save();
        }
    }
}

const Department = {
    async GetRoot(){
        let departments = await (await models.Department).find({
        });
        for(let index in departments){
            if(departments[index].parent_id == "")
                return departments[index];
        }        
    },

    async GetBelongDepartmentsByDepartmentID(departmentID){
        if(!departmentID)
            return;
        let departments = [];
        let department = await this.GetDepartmentInfoByDepartmentID(departmentID);
        if(department)
            departments.unshift(department);
        if(department.parent_id == '')
            return departments;
        let sub = await this.GetBelongDepartmentsByDepartmentID(department.parent_id);
        if(!sub)
            return;
        return sub.concat(departments);
    },

    async GetBelongDepartmentsByMatrixID(matrixID){
        let department = await this.GetDepartmentInfoByMatrixID(matrixID);
        console.log(department)
        if(department)
            return await this.GetBelongDepartmentsByDepartmentID(department.department_id);
    },

    async GetMaxDeparmentUpdateTime(){
        let departments = await (await models.Department).find({
            $order: {
                by: 'updatetime',
                reverse: true
            },
            $size: 1
        });
        if(departments.length == 0)
            return 0;
        return departments[0].updatetime;
    },

    async GetAllDepartment(){
        let departments = await (await models.Department).find({

        });
        return departments;
    },

    async GetSubDepartment(departmentID){
        let departments = await (await models.Department).find({
            parent_id: departmentID
        });
        return departments
         
    },

    async GetAdminId(departmentID){
        let departments = await (await models.Department).find({
            department_id: departmentID
        });
        if(departments.length == 1){
            return departments[0].admin_id;
        }
    },

    async GetDepartmentInfoByUserID(userID){
        let userinfo = await UserInfo.GetUserInfo(userID);
        if(userinfo != undefined)
            return await this.GetDepartmentInfoByDepartmentID(userinfo.belong_to_department_id);
    },

    async GetDepartmentInfoByMatrixID(matrixID){
        let userinfo = await UserInfo.GetUserInfoByMatrixID(matrixID);
        if(userinfo != undefined)
            return await this.GetDepartmentInfoByDepartmentID(userinfo.belong_to_department_id);
    },

    async GetDepartmentInfoByDepartmentID(departmentID){
        let departments = await (await models.Department).find({
            department_id: departmentID
        });
        if(departments.length == 1){
            return departments[0];
        }
    },

    async SearchByNameKey(key){
        let departments = await (await models.Department).find({
            display_name: "%"+key
        });
        return departments;
    }
};

const UserInfo = {
    async DeleteUserByUserID(userID){
        let userinfos = await(await models.UserInfo).find({
            user_id: userID
        })
        if(userinfos.length != 0)
            userinfos[0].destroy();
    },

    async DeleteUserByMatrixID(matrixID){
        let userinfos = await(await models.UserInfo).find({
            matrix_id: matrixID
        })
        if(userinfos.length != 0)
            userinfos[0].destroy();
    },

    async GetMaxUpdateTime(){
        let userinfos = await(await models.UserInfo).find({
            $order: {
                by: 'updatetime',
                reverse: true
            },
            $size: 1
        });
        if(userinfos.length == 0)
            return 0;
        return userinfos[0].updatetime;
    },
        
    async GetAllUserInfo(){
        let userinfos = await(await models.UserInfo).find({

        });
        return userinfos;
    },
    async GetSubUserinfo(departmentID){
        let userinfos = await(await models.UserInfo).find({
            belong_to_department_id: departmentID
        })
        userinfos.sort((item1, item2) => {
            return pinyin.compare(item1.user_display_name, item2.user_display_name)
        })
        return userinfos;
    },

    async GetSubUserinfoByPage(departmentID, perPage, page){
        let userinfos = await(await models.UserInfo).find({
            belong_to_department_id: departmentID,
            $offset: perPage * page,
            $size: perPage,
        })
        return userinfos;
    },

    async GetUserInfoByMatrixID(matrixID){
        let userinfos = await(await models.UserInfo).find({
            matrix_id: matrixID
        })
        if(userinfos.length != 0)
            return userinfos[0];
        return undefined;
    },

    async GetUserInfo(userID){
        let userinfos = await(await models.UserInfo).find({
            user_id: userID
        })
        if(userinfos.length != 0)
            return userinfos[0];
        return undefined;
    },

    async GetUserInfos(matrixIDArray){
        return await(await models.UserInfo).find({
            matrix_id: matrixIDArray
        });
    },
    
    async GetUserAddress(userID){
        let address = await(await models.UserAddress).find({
            owner_user_id: userID
        })
        return address;
    },

    async GetUserIm(userID){
        let im = await(await models.UserIm).find({
            owner_user_id: userID
        })
        return im;
    },

    async GetUserEmailByUserID(userID){
        let email = await(await models.UserEmail).find({
            owner_user_id: userID
        })
        return email;
    },

    async GetUserPhoneByUserID(userID){
        let phone = await(await models.UserPhone).find({
            owner_user_id: userID
        })
        return phone;
    },

    async GetLeaders(userID){
        let array = [];
        if(userID != ""){
            let infos = await(await models.UserInfo).find({
                user_id: userID
            })
            if(infos.length != 1){
                return undefined;
            }
            array = infos;
            if(infos[0].manager_id == "" || userID == infos[0].manager_id)
                return array;
            return array.concat(await this.GetLeaders(infos[0].manager_id));
        }
    },

    async SearchByNameKey(key){
        let infos = await(await models.UserInfo).find({
            user_display_name:  "%"+key,
            _user_name:          "%"+key,
            _user_title:         "%"+key,
            _display_name_py:    "%"+key,
            $size: 20
        })
        return infos;
    },

    async UpdateUserAvater(userID, oUrl, tUrl){
        let userinfo = await(await models.UserInfo).find({
            user_id: userID
        })
        if(userinfo.length == 1){
            userinfo[0].avatar_o_url = oUrl;
            userinfo[0].avatar_t_url = tUrl;
            userinfo[0].save();
        }
    },

    async UpdateUserWorkDescription(userID, description){
        let user = await this.GetUserInfo(userID);
        if(user != undefined){
            user.work_description = description;
            user.save();
        }
    },

    async UpdateUserStatusDescription(userID, description){
        let user = await this.GetUserInfo(userID);
        if(user != undefined){
            user.status_description = description;
            user.save();
        }
    }
}

const Message = {
    async DeleteMessage(messageID){
        let msg = await(await models.Message).find({
            message_id: messageID
        })
        for(let index in msg)
        {
            msg[index].destroy();
        }
    },

    async GetBeforeMessage(groupId, stamp, count){
        let condition;
        condition = {
            group_id: groupId,
            message_timestamp:{
                lte: stamp
            },
            $order: {
                by: 'message_timestamp',
                reverse: true
            },
            $size: count
        };
        return await (await models.Message).find(condition)
    },

    async GetAfterMessage(groupId, sequenceID, count){
        let condition;
        condition = {
            group_id: groupId,
            sequence_id:{
                gt: sequenceID
            },
            $order: {
                by: 'message_timestamp',
                reverse: false
            },
            $size: count
        };
        return await (await models.Message).find(condition)
    },

    async ExistMessageBySequenceID(sequenceID){
        let msgs = await(await models.Message).find(
            {
                sequence_id: sequenceID
            }
        );
        if(msgs.length == 0){
            return false;
        }
        return true;
    },

    async FindMessageBySequenceID(sequenceID){
        return await(await models.Message).find(
            {
                sequence_id: sequenceID
            }
        );
    },

    async FindMessageByMesssageID(msgID){
        return await (await models.Message).find({
            message_id: msgID
        })
    },

    async SequenceIDtoTimeStamp(sequenceID){
        let msgs = await this.FindMessageBySequenceID(sequenceID);
        if(msgs.length == 0)
            return 0;
        console.log(msgs);
        return msgs[0].message_timestamp;
    },

    async SetMessageStatus(msgID, status){
        let msgs = await this.FindMessageByMesssageID(msgID);
        if(msgs.length == 0)
            return false;
        else{
            msgs[0].message_status = status;
            msgs[0].save();
        }
        return true;
    },

    async GetMaxSecretMsgSequenceID(){
        let messages = await(await models.Groups).find({
            key_id:{
                ne: ""
            },
            $order:{
                by: "sequence_id",
                reverse: true
            },
            $size: 1
        });

        if(messages.length == 1)
            return messages[0].sequence_id;
        return 0;
    }
}

const Group = {
    async UpdateGroupStatus(groupID, status){
        let groups = await(await models.Groups).find({
            group_id: groupID
        })
        if(groups.length == 1){
            groups[0].status = status;
            groups[0].save();
        }
    },

    async GetGroupByTime(){
        let groups = await(await models.Groups).find({
            $order: {
                by: 'last_message_time',
                reverse: true
              }
        })
        return groups;
    },

    async FindItemFromGroupByGroupID(groupid){
        var groups = await(await models.Groups).find({
            group_id: groupid
          });
        if(groups.length == 0){
            return undefined;
        }
        return groups[0];
    },

    async SearchByNameKey(key){
        let groups = await(await models.Groups).find({
            group_name:  "%"+key
        })
        return groups;
    },

    async SearchSecretByNameKey(name){
        let allGroups = await this.SearchByNameKey(name);
        let distGroups = [];
        for(let index in allGroups){
            console.log("SearchSecretByNameKey ", allGroups)
            if(allGroups[index].group_type == 102 && allGroups[index].key_id != undefined && allGroups[index].key_id.length != 0) {
                allGroups[index].message = JSON.parse(allGroups[index].message_content);
                distGroups.unshift(allGroups[index]);
            }
        }
        return distGroups;
    },

    async SearchChatByNameKey(name){
        let allGroups = await this.SearchByNameKey(name);
        let distGroups = [];
        for(let index in allGroups){
            console.log("SearchSecretByNameKey ", allGroups)
            if(allGroups[index].group_type == 102 && (allGroups[index].key_id == undefined || (allGroups[index].key_id != undefined && allGroups[index].key_id.length == 0))) {
                allGroups[index].message = JSON.parse(allGroups[index].message_content);
                distGroups.unshift(allGroups[index]);
            }
        }
        return distGroups;
    },

    async UpdateGroupAvatar(groupID, avatar){
        var groups = await this.FindGroupByID(groupID);
        if(groups.length == 1){
            groups[0].group_avarar = avatar;
            groups[0].save();
        }
    },

    async FindGroupByID(groupID)
    {
        return await(await models.Groups).find({
            group_id: groupID
          });
    },

    async GetMaxSecretGroupUpdateTime(){
        let groups = await(await models.Groups).find({
            key_id:{
                ne: ""
            },
            $order:{
                by: "updatetime",
                reverse: true
            },
            $size: 1
        });
        if(groups.length == 1)
            return groups[0].updatetime;
        return 0;
    }
}

const Collection = {
    async DeleteFavouriteByType(type){
        let favs = await (await models.Collection).find({
            collection_type: type
        });
        for(let item of favs){
            await item.destroy();
        }
    },

    async FindItemByFavouriteID(favouriteID){
        let collections = await (await models.Collection).find({
            favourite_id: favouriteID
        });
        if(collections.length != 0){
            return collections[0];
        }
        return undefined;
    },

    async FindItemByCollectionID(collectionID){
        let collections = await (await models.Collection).find({
            collection_id: collectionID
        });
        if(collections.length != 0){
            return collections[0];
        }
        return undefined;
    },

    async FindCollectionByType(type){
        let collections = await(await models.Collection).find(
            {
                collection_type: type,
                $order: {
                    by: 'timestamp',
                    reverse: true
                },
            }
        );
        return collections;
    },

    async FindMaxCollectionSequenceID(type){
        let collections = await(await models.Collection).find(
            {
                collection_type: type,
                $order: {
                    by: 'sequence_id',
                    reverse: true
                    },
                $size: 1
            }
        );
        
        if(collections.length == 0){
            return 0;
        }
        return collections[0].sequence_id;
    }
}

const Config = {
    async SetAutoStart(value){
        let configs = await(await models.Config).find();
        let configModel;
        if(configs.length == 0){   
            let ConfigValues = {
                auto_start: value
            }
            configModel = new (await models.Config)(ConfigValues);
            configModel.save();
        }
        else{
            configs[0].auto_start = value;
            configs[0].save();
        }
    },

    async GetAutoStart(){
        let configs = await(await models.Config).find();
        if(configs.length != 0){
            return configs[0].auto_start;
        }   
        return 1;
    },

    async SetMessageSound(value){
        await this.SetValue("message_sound", value);
    },

    async SetMessageNotice(value){
        await this.SetValue("message_notice", value);
    },

    async SetAutoUpdate(value){
        await this.SetValue("auto_update", value);
    },

    async SetValue(key, value){
        let logins = await(await models.Login).find();
        if(logins.length == 0)
            return;
        let userid = logins[0].user_id;
        var foundUsers = await(await models.User).find({
            id: userid
          });
        if(foundUsers.length == 0){
            return;
        }
        foundUsers[0][key] = value;
        foundUsers[0].save();
    },

    async GetValue(){
        let logins = await(await models.Login).find();
        if(logins.length == 0)
            return;
        let userid = logins[0].user_id;
        var foundUsers = await(await models.User).find({
            id: userid
          });
        if(foundUsers.length == 0){
            return;
        }
        return foundUsers[0];
    }
}

const Secret = {
    async InsertSecret(secret){
        let secrets = await (await models.Secret).find({
            key_id: secret.key_id
        })
        if(secrets.length == 0)
            secret.save();
    },

    async GetAllSecret(){
        return await (await model.Secret).find();
    },

    async GetNewSecret(){
        let secrets = await (await models.Secret).find({
            $order: {
                by: 'key_id',
                reverse: true
                }
        })
        if(secrets.length != 0)
            return secrets[0];
        else
            return undefined;
    },

    async FindByKeyID(keyID){
        if(keyID == undefined)
            return undefined;
        let secrets = await (await models.Secret).find({
            key_id: keyID
        })
        if(secrets.length != 0)
            return secrets[0];
        return undefined;
    }


}

const Contact = {
    async GetAllContact(){
        let contacts =  await (await models.Contact).find()
        return contacts.sort((item1, item2) => {
            return pinyin.compare(item1.display_name, item2.display_name)
        })
    },

    async DeleteAllContact(){
        await(await models.Contact).truncate();
    },

    async GetMaxUpdateTime(){
        let contacts = await (await models.Contact).find(
            {
                $order: {
                    by: 'updatetime',
                    reverse: true
                    },
                $size: 1
            });
        if(contacts.length != 0)
            return contacts[0].updatetime;
        return 0;
    },

    async GetContactInfo(id){
        let contacts = await (await models.Contact).find(
            {
                matrix_id: id
            });
        if(contacts.length != 0)
            return contacts[0];
        return null;
    },

    async DeleteContact(id){
        let contacts = await (await models.Contact).find(
            {
                matrix_id: id
            });
        if(contacts.length != 0)
            await contacts[0].destroy();
    },

    async UpdateContact(matrixID,
                        remarkName,
                        email,
                        mobile,
                        telephone,
                        company,
                        title){
        let contacts = await (await models.Contact).find(
            {
                matrix_id: matrixID
            });
        if(contacts.length != 0)
        {
            contacts[0].display_name = remarkName;
            contacts[0].email = email;
            contacts[0].mobile = mobile;
            contacts[0].telephone = telephone;
            contacts[0].company = company;
            contacts[0].title = title;
            await contacts[0].save();
        }
    },

    async SearchByNameKey(key){
        let contacts = await(await models.Contact).find({
            display_name:  "%"+key,
            _matrix_id:          "%"+key,
            _title:         "%"+key,
            $size: 20
        })
        return contacts;
    },
}

const ContactRoom = {
    async DeleteByRoomID(roomID){
        let rooms = await(await models.FavouriteRoom).find({
            room_id: roomID
        });
        if(rooms.length != 0){
            rooms[0].destroy();
        }
    },

    async ExistRoom(roomID){
        let rooms = await(await models.FavouriteRoom).find({
            room_id: roomID
        });
        return rooms.length != 0;
    },

    async GetAllRooms(){
        return await(await models.FavouriteRoom).find();
    },

    async GetMaxUpdateTime(){
        let rooms = await (await models.FavouriteRoom).find({
            $order: {
                by: 'updatetime',
                reverse: true
            },
            $size: 1
        });
        if(rooms.length == 0)
            return "0";
        return rooms[0].updatetime
    }
}

export{
    sqliteutil,
    Department,
    UserInfo,
    Message,
    Group,
    Collection,
    Config,
    Secret,
    Contact,
    ContactRoom
}