import { models } from './models.js';


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

    async GetMaxUserUpdatetime(userid){
        let groups = await(await models.User).find({
            id: userid
        });
        if(groups.length == 0)
        {
            return 0;
        }
        let item = groups[0];
        return item.user_max_updatetime;
    },

    async UpdateMaxUserUpdatetime(userid, updatetime){
        var foundUsers = await(await models.User).find({
            id: userid
          });
        if(foundUsers.length == 0){
            return;
        }
        foundUsers[0].user_max_updatetime = updatetime;
        foundUsers[0].save();
    },

    async GetMaxDepartmentUpdatetime(userid){
        let groups = await(await models.User).find({
            id: userid
        });
        if(groups.length == 0)
        {
            return 0;
        }
        let item = groups[0];
        return item.department_max_updatetime;
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
            collections[0].destroy();
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
    async GetSubUserinfo(departmentID){
        let userinfos = await(await models.UserInfo).find({
            belong_to_department_id: departmentID
        })
        return userinfos;
    },

    async GetUserInfo(userID){
        let userinfos = await(await models.UserInfo).find({
            user_id: userID
        })
        if(userinfos.length != 0)
            return userinfos[0];
        return undefined;
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
            if(infos[0].manager_id == "")
                return array;
            return array.concat(await this.GetLeaders(infos[0].manager_id));
        }
    },

    async SearchByNameKey(key){
        let infos = await(await models.UserInfo).find({
            user_display_name:  "%"+key,
            _user_name:          "%"+key,
            _user_title:         "%"+key,
            _display_name_py:    "%"+key
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

    async GetBeforeMessage(groupId, sequenceID, count){
        let condition;
        condition = {
            group_id: groupId,
            sequence_id:{
                lte: sequenceID
            },
            $order: {
                by: 'sequence_id',
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
                by: 'sequence_id',
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
    }
}

const Collection = {
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


export{
    sqliteutil,
    Department,
    UserInfo,
    Message,
    Group,
    Collection
}