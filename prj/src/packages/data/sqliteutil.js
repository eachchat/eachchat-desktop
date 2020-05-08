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

    async FindItemFromGroupByGroupID(groupid){
        var groups = await(await models.Groups).find({
            group_id: groupid
          });
        if(groups.length == 0){
            return undefined;
        }
        return groups[0];
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

    async FindItemByCollectionID(collectionID){
        let collections = await (await models.Collection).find({
            collection_id: collectionID
        });
        if(collections.length != 0){
            return collections[0];
        }
        return undefined;
    }
}

export{
    sqliteutil
}