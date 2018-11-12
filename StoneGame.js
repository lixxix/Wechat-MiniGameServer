var GameLogic = require("./GameLogic");
var GAMEMSG = require("./cmd_game");

class StoneGame extends GameLogic {
    constructor(){
        super();
        this.operator = new Set();
        this.teamPtr = null;
    }

    OnGameMessage(socket,id,data)
    {
        switch(id)
        {
            case GAMEMSG.SUB_GAME_ACTION:
            {
                if (this.operator.has(socket.user.chair) == false)
                {
                    this.operator.add(socket.user.chair);
                }

                if (this.operator.size == 2)
                {
                    this.SendDataAll(GAMEMSG.SUB_GAME_END, {info:"game end"});
                }
                else
                {
                    let chairid = socket.user.chair+1;
                    if (chairid >= 2)
                        chairid = 0;

                    this.SendDataAll(GAMEMSG.SUB_GAME_ACTION, {chair:chairid,info:'change to another user'});
                }
            }
            break;
        }
        return true;
    }

    OnSubGameStart()
    {
        console.log("Stone Game GameStart");

        this.SendDataAll(GAMEMSG.SUB_GAME_START,{info:'start', chair:0});
    }
}

module.exports = StoneGame;