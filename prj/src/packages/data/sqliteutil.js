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
        var foundUsers = await(await models.User).find({
            id: userid
          });
        if(foundUsers.length == 0){
            return;
        }
        foundUsers[0].department_max_updatetime = updatetime;
        foundUsers[0].save();
    },

}

export{
    sqliteutil
}