import { models } from './models.js';
import {common} from "./services.js"

class BaseMqttHandler{
    constructor(message, callback, accesstoken){
        this.accesstoken = accesstoken;
        this.message = message;
        this.callback = callback;
        this.type = message.name;
    }
    async handle(){
    }
}

class MessageHandler extends BaseMqttHandler{
    constructor(message, callback, accesstoken){
        super(message, callback, accesstoken);
    }
    async handle(){
        if(this.type == "newMessage"){
            console.log(this.type);
        }
        else{
            let handler = new GroupHandler(this.message, this.callback, this.accesstoken);
            handler.handle();
        }
    }
}

class GroupHandler extends BaseMqttHandler{
    constructor(message, callback, accesstoken){
        super(message, callback, accesstoken)
    }
    handle(){
        if(this.type == "updateGroup"){
            console.log(this.type);
        }
        else{
            let handler = new UserHandler(this.message, this.callback, this.accesstoken);
            handler.handle();
        }
    }
}

class UserHandler extends BaseMqttHandler{
    constructor(message, callback, accesstoken){
        super(message, callback, accesstoken)
    }
    handle(){
        if(this.type == "updateUser"){
            console.log(this.type);
        }
        else{
            let handler = new DepartmentHandler(this.message, this.callback, this.accesstoken);
            handler.handle();
        }
    }
}

class DepartmentHandler extends BaseMqttHandler{
    constructor(message, callback, accesstoken){
        super(message, callback, accesstoken)

    }
    handle(){
        if(this.type == "updateDepartment"){
            console.log(this.type);
        }
        else{
            let handler = new TopicHandler(this.message, this.callback, this.accesstoken);
            handler.handle();
        }
    }

}

class TopicHandler extends BaseMqttHandler{
    constructor(message, callback, accesstoken){
        super(message, callback, accesstoken)
    }
    handle(){
        if(this.type == "updateTopic"){
            console.log(this.type);
        }
        else{
            let handler = new ReplyTopicHandler(this.message, this.callback, this.accesstoken);
            handler.handle();
        }
    }

}

class ReplyTopicHandler extends BaseMqttHandler{
    constructor(message, callback, accesstoken){
        super(message, callback, accesstoken)

    }
    handle(){
        if(this.type == "updateReplyTopic"){
            console.log(this.type);
        }
        else{
            let handler = new TopicCountHandler(this.message, this.callback, this.accesstoken);
            handler.handle();
        }
    }
}

class TopicCountHandler extends BaseMqttHandler{
    constructor(message, callback, accesstoken){
        super(message, callback, accesstoken)
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

function mqttrouter(message, callback, accesstoken)
{
    let msghandler = new MessageHandler(message, callback, accesstoken);
    msghandler.handle();
}

export {
    mqttrouter
  }
  