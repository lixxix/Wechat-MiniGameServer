class GameLogic
{
    constructor(){
        this.Users = [];
    }
    
    SendData(chairid,id, data)
    {
        if (chairid >= 0 && chairid < this.Users.length)
        {
            this.Users[chairid].SendToGame(id,data);
        }
    }

    SendDataAll(id, data)
    {
        for (let i = 0;i < this.Users.length; i++)
        {
            this.Users[i].SendToGame(id,data);
        }
    }

    OnGameMessage(socket, id, data)
    {
        return true;
    }

    OnSubGameStart()
    {
        console.log("GameStart");
    }
}

module.exports = GameLogic;