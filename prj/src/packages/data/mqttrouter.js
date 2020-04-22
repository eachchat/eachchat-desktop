import { models } from './models.js';


class BaseMqttHandler{
    constructor(message, callback){
        this.callback = callback;
        this.type = message.name;
    }
    async handle(){
    }
}

class MessageHandler extends BaseMqttHandler{
    constructor(message, callback){
        super(message, callback);
    }
    async handle(){
        if(this.type == "newMessage"){
            console.log(this.type);
        }
        else{
            let handler = new GroupHandler(this.message, callback);
            handler.handle();
        }
    }
}

class GroupHandler extends BaseMqttHandler{
    constructor(message, callback){
        super(message, callback)
    }
    handle(){
        if(this.type == "updateGroup"){
            console.log(this.type);
        }
        else{
            let handler = new UserHandler(this.message, callback);
            handler.handle();
        }
    }
}

class UserHandler extends BaseMqttHandler{
    constructor(message, callback){
        super(message, callback)
    }
    handle(){
        if(this.type == "updateUser"){
            console.log(this.type);
        }
        else{
            let handler = new DepartmentHandler(this.message, callback);
            handler.handle();
        }
    }
}

class DepartmentHandler extends BaseMqttHandler{
    constructor(message, callback){
        super(message, callback)

    }
    handle(){
        if(this.type == "updateDepartment"){
            console.log(this.type);
        }
        else{
            let handler = new TopicHandler(this.message, callback);
            handler.handle();
        }
    }

}

class TopicHandler extends BaseMqttHandler{
    constructor(message, callback){
        super(message, callback)
    }
    handle(){
        if(this.type == "updateTopic"){
            console.log(this.type);
        }
        else{
            let handler = new ReplyTopicHandler(this.message, callback);
            handler.handle();
        }
    }

}

class ReplyTopicHandler extends BaseMqttHandler{
    constructor(message, callback){
        super(message, callback)

    }
    handle(){
        if(this.type == "updateReplyTopic"){
            console.log(this.type);
        }
        else{
            let handler = new TopicCountHandler(this.message, callback);
            handler.handle();
        }
    }
}

class TopicCountHandler extends BaseMqttHandler{
    constructor(message, callback){
        super(message, callback)
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

function mqttrouter(message, callback)
{
    let msghandler = new MessageHandler(message, callback);
    msghandler.handle();
}

export {
    mqttrouter
  }
  