import {ServerApi} from '../../renderer/server/serverapi.js'
import {model, sqlite} from '../core/index.js' 


class DbModels
{
    m_sqliteConnection;
    m_serverapi;
    m_loginmodel;
    m_usermodel;
    m_loginmodel;
    constructor(protocal, ip, dbpath){
        self.m_serverapi = new ServerApi(protocal, ip);
        self.m_sqliteConnection = new sqlite.Sqlite(dbpath);

        self.m_loginmodel = new model.Model.create(
            self.m_sqliteConnection,
            'login',
            {
              id: model.integer,
              access_token: model.text,
              refresh_token: model.text,
              account: model.text,
              password: model.text
            },
            'id',
            'id'
          );
        self.m_loginmodel.save()
    }

    async Login(username, password)
    {
        let res = await m_serverapi.Login(username, password)
        return res
    }

    Logout()
    {
        return m_serverapi.Logout().then(function(response){
            console.log(response)
        })
    }

    GetUserinfo(filters_value, perPage_value, sortOrder_value, sequenceId_value)
    {
        return m_serverapi.GetUserinfo(filters_value, perPage_value, sortOrder_value, sequenceId_value).then(function(response){
            console.log(response)
        })
    }


}

export{DbModels};