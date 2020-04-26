import { models } from './models.js';

class BaseMqttHandler{
    constructor(message, callback, services){
        this.services = services;
        this.message = message;
        this.callback = callback;
        this.type = message.name;
    }
    async handle(){
    }
}

class MessageHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services);
    }
    async handle(){
        if(this.type == "newMessage"){
            let maxsequenceid;
            if(this.services.data.currentsequenceid == undefined)
            {
                let selfmodel = await(this.services.GetSelfUserModel());
                maxsequenceid = selfmodel.maxsequenceid;
            }
            await this.services.ReveiveNewMessage(maxsequenceid, 0, this.callback);
        }
        else{
            let handler = new GroupHandler(this.message, this.callback, this.services);
            await handler.handle();
        }
    }
}

class GroupHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)
    }
    async handle(){
        if(this.type == "updateGroup"){
            let updatetime = this.message.value.updateTime;
            await this.services.groupIncrement(updatetime, 0);
        }
        else{
            let handler = new UserHandler(this.message, this.callback, this.services);
            await handler.handle();
        }
    }
}

class UserHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)
    }
    async handle(){
        if(this.type == "updateUser"){
            let userinfos = await (await models.UserInfo).find({
                $order: {
                    by: 'updatetime',
                    reverse: true
                  },
                  $size: 1
            })
            if(userinfos.length == 0)
            {
                return;
            }
            let updatetime = userinfos[0].updatetime;
            await this.services.clientIncrement(this.type, updatetime, 0, 0);
        }
        else{
            let handler = new DepartmentHandler(this.message, this.callback, this.services);
            await handler.handle();
        }
    }
}

class DepartmentHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)

    }
    async handle(){
        if(this.type == "updateDepartment"){
            let department = await (await models.Department).find({
                $order: {
                    by: 'updatetime',
                    reverse: true
                  },
                  $size: 1
            })
            if(department.length == 0)
            {
                return;
            }
            let updatetime = department[0].updatetime;
            await this.services.clientIncrement(this.type, updatetime, 0, 0);
        }
        else{
            let handler = new TopicHandler(this.message, this.callback, this.services);
            await handler.handle();
        }
    }

}

class TopicHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)
    }
    async handle(){
        if(this.type == "updateTopic"){
            console.log(this.type);
        }
        else{
            let handler = new ReplyTopicHandler(this.message, this.callback, this.services);
            await handler.handle();
        }
    }

}

class ReplyTopicHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)

    }
    async handle(){
        if(this.type == "updateReplyTopic"){
            console.log(this.type);
        }
        else{
            let handler = new TopicCountHandler(this.message, this.callback, this.services);
            await handler.handle();
        }
    }
}

class TopicCountHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)
    }
    async handle(){
        if(this.type == "updateReplyTopic"){
            console.log(this.type);
        }
        else{
            console.log("unknow mqtt messagetype:" + this.type);
        }
    }
}

async function mqttrouter(message, callback, services)
{
    let msghandler = new MessageHandler(message, callback, services);
    await msghandler.handle();
}

export {
    mqttrouter
  }
  