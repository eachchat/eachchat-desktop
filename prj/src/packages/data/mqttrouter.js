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
            this.services.ReveiveNewMessage(maxsequenceid, 0, this.callback);
        }
        else{
            let handler = new GroupHandler(this.message, this.callback, this.services);
            handler.handle();
        }
    }
}

class GroupHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)
    }
    handle(){
        if(this.type == "updateGroup"){
            console.log(this.type);
        }
        else{
            let handler = new UserHandler(this.message, this.callback, this.services);
            handler.handle();
        }
    }
}

class UserHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)
    }
    handle(){
        if(this.type == "updateUser"){
            console.log(this.type);
        }
        else{
            let handler = new DepartmentHandler(this.message, this.callback, this.services);
            handler.handle();
        }
    }
}

class DepartmentHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)

    }
    handle(){
        if(this.type == "updateDepartment"){
            console.log(this.type);
        }
        else{
            let handler = new TopicHandler(this.message, this.callback, this.services);
            handler.handle();
        }
    }

}

class TopicHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)
    }
    handle(){
        if(this.type == "updateTopic"){
            console.log(this.type);
        }
        else{
            let handler = new ReplyTopicHandler(this.message, this.callback, this.services);
            handler.handle();
        }
    }

}

class ReplyTopicHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)

    }
    handle(){
        if(this.type == "updateReplyTopic"){
            console.log(this.type);
        }
        else{
            let handler = new TopicCountHandler(this.message, this.callback, this.services);
            handler.handle();
        }
    }
}

class TopicCountHandler extends BaseMqttHandler{
    constructor(message, callback, services){
        super(message, callback, services)
    }
    handle(){
        if(this.type == "updateReplyTopic"){
            console.log(this.type);
        }
        else{
            console.log("unknow mqtt messagetype:" + this.type);
        }
    }
}

function mqttrouter(message, callback, services)
{
    let msghandler = new MessageHandler(message, callback, services);
    msghandler.handle();
}

export {
    mqttrouter
  }
  