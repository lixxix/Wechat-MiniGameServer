const PlayerCount = 2;

const MSG = require("./message");
var GameLogic = require('./StoneGame');

class Team {

    constructor() {
        this.Users = new Set();
        this.bStarted = false;
        this.gameLogic = null;
    }


    JoinUser(socket) {
        if (socket == null || socket == undefined)
            return false;
        if (socket.user == null || socket.user == undefined)
            return false;

        if (this.Users.size < PlayerCount && this.Users.has(socket) == false) {
            this.Users.add(socket);
            socket.team = this;
            return true;
        }
        return false;
    }

    CheckGameStart() {
        if (this.bStarted == false && this.Users.size == PlayerCount) {
            this.bStarted = true;
            //游戏开始，创建游戏Logic
            this.gameLogic = new GameLogic;
            this.gameLogic.teamPtr = this;
            let UserData = []
            let index = 0;
            for (let x of this.Users)
            {
                x.user.chair = index;

                UserData.push(x.user);
                this.gameLogic.Users[index] = x;
                index+=1;
                
            }     
            
            for (let x of this.Users)
            {
                x.SendToServer(MSG.GAME_SEND_START, UserData);
            }
            return true;
        }
    }

    OnUserLeave(socket){
        this.Users.delete(socket);
        socket.team = null;
        this.bStarted = false;
    }

    OnGameMessage(socket, data)     //who 和 数据
    {
        if (this.bStarted)
            this.gameLogic.OnGameMessage(socket, data);
    }

    OnUserReady(socket)
    {
        if (this.Users.has(socket))
        {
            socket.user.ready = true;

            for (let x of this.Users)
            {
                if (x == socket)
                    continue;
                
                if (x.user.ready != true)
                {
                    return true;
                }
            }    
            
            if (this.gameLogic)
            {
                this.gameLogic.OnSubGameStart();
            }
            
            return true;
        }
        else
            return false;
    }
}

class Server {
    constructor() {
        this.UserSocket = new Map();
        this.Teams = new Set();
        //关于Team 完成即删除，开始即创建
    }


    UserJoinTeam(socket) {
        if (socket == null || socket == undefined)
            return false;
        if (socket.user == null || socket.user == undefined)
            return false;
    }

    OnMessageRead(socket, data)
    {
        let obj = JSON.parse(data);
        if (obj && obj.type != undefined) {
            switch (obj.type) {
                case 1: {
                    this.OnServerMessage(socket,obj);
                } 
                break;
                default:
                {
                    this.OnGameMessage(socket,obj);
                }
                break;
            }
        }
    }

    OnServerMessage(socket ,data)
    {
        let obj = data;
        switch(obj.id)
        {
            case MSG.LOGON:
            {
                if (this.UserSocket.has(obj.data.openid)) {
                    
                    socket.SendToServer(MSG.LOGON_FAILED,{err:'已经在其他地方登陆了'})
                    // socket.send({type:1,id:MSG.LOGON_FAILED,data:{}})
                    socket.close();
                    return;
                }
                else {
                    this.UserSocket.set(obj.data.openid, socket);
                    socket.SendToServer(MSG.LOGON, { userid: 1 });
                    socket.user = obj.data;
                    socket.SendToServer(MSG.LOGON_SUCCESS,null);
                }  
            }
            break;
            case MSG.GAME_SEND_START:
            {
                for (let team of this.Teams)
                {
                    if (team.JoinUser(socket))
                    {
                        team.CheckGameStart();
                        return;
                    }
                }

                //创建一个Team
                let tempTeam = new Team();
                this.Teams.add(tempTeam);
                tempTeam.JoinUser(socket);
                return;          
            }
            break;
            case MSG.GAME_SEND_READY:
            {
                if (socket.team)
                {
                    // socket.team.
                    socket.team.OnUserReady(socket);
                }
            }   
            break;
        }
   
    }

    OnGameMessage(socket, obj)
    {
        if (socket.team)
        {
            socket.team.OnGameMessage(socket,obj.id, obj.data);
        }
    }

    OnUserLeave(socket)
    {
        if (socket)
        {
            if (socket.user != undefined)
                this.UserSocket.delete(socket.user.openid);
            if (socket.team)
            {
                socket.team.OnUserLeave(socket);
            }
        }
    }
}

module.exports = Server;