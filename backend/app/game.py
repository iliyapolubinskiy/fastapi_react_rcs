from fastapi import WebSocket
from .db.database import SessionLocal
from .db import crud
from uuid import UUID

class Game:

    """
    Managing game proccess
    """

    def __init__(self, manager):
        self.manager = manager
        self.readies = []
        self.games = {}
        self.results = {}


    async def add_readies(self, websocket: WebSocket):
        """
        Add websocket connetion to ready list.
        Usable for notify second player that player joined/left
        """
        if websocket not in self.readies:
            self.readies.append(websocket)
        amount_of_ready = 0
        for ws in self.readies:
            if ws.get("path") == websocket.get("path"):
                amount_of_ready += 1
                await self.send_status_to_opponent(websocket, status = True)
        if amount_of_ready == 2:
            for ws in self.readies:
                if ws.get("path") == websocket.get("path"):
                    await self.send_status_to_opponent(websocket, status = True)
                    await ws.send_json({"command": "start"})


    async def remove_readies(self, websocket):
        """
        Remove websocket connection from ready list
        """
        if websocket in self.readies:
            self.readies.remove(websocket)
        await self.send_status_to_opponent(websocket, status = False)


    async def send_status_to_opponent(self, websocket: WebSocket, status: bool):
        """
        Method to send data to connections in room about connections amount
        """
        path = websocket.get("path")
        for ws in self.manager.active_connections:
            if ws != websocket and ws.get("path") == path:
                await ws.send_json({"command": "update_opponent_status",
                                      "opponent_status": status})


    async def update_players_status(self, websocket):
        for ws in self.manager.active_connections:
            if ws.get("path") == websocket.get("path") and ws != websocket:
                await websocket.send_json({"command": "update_opponent_status",
                                      "opponent_status": ws in self.readies})


    async def on_game_over(self, path: str, gamer: int, result: dict):
        """
        will be commented soon
        """

        if not self.games.get(path): 
            self.games[path] = {}
        self.games[path][gamer] = result


        # self.games[path][gamer] = { roomNumber: roomNumber, item: myChoice, user: currentUser }
        if len(self.games[path]) == 2:
            await self.get_winner(self.games[path], path)
            self.games[path] = {}   
        

    async def get_winner(self, result: dict, path: str):
        """
        method to get winner, loser, items
        """
        values=[] # gamer1, gamer2
        keys=[] # {roomNumber: roomNumber, item: myChoice, user: currentUser}, {roomNumber: roomNumber, item: myChoice, user: currentUser}
        for k, v in result.items(): # (gamer1, {roomNumber: roomNumber, item: myChoice, user: currentUser}),  (gamer2, {roomNumber: roomNumber, item: myChoice, user: currentUser})
            values.append(v)
            keys.append(k)

        # result[keys[0]] = {roomNumber: roomNumber, item: myChoice, user: currentUser} from gamer1

        if values[0]["item"] == values[1]["item"]:
            await self.send_result(path, keys[1], keys[0], {"winner": {keys[1]: result[keys[1]]}, "loser": {keys[0]: result[keys[0]]}}, is_dead_heat=True)
        elif values[0]["item"] == "rock" and values[1]["item"] == "paper":
            await self.send_result(path, keys[1], keys[0], {"winner": {keys[1]: result[keys[1]]}, "loser": {keys[0]: result[keys[0]]}})
        elif values[0]["item"] == "rock" and values[1]["item"] == "scissors":
            await self.send_result(path, keys[0], keys[1], {"winner": {keys[0]: result[keys[0]]}, "loser": {keys[1]: result[keys[1]]}})
        elif values[0]["item"] == "paper" and values[1]["item"] == "rock":
            await self.send_result(path, keys[0], keys[1], {"winner": {keys[0]: result[keys[0]]}, "loser": {keys[1]: result[keys[1]]}})
        elif values[0]["item"] == "paper" and values[1]["item"] == "scissors":
            await self.send_result(path, keys[1], keys[0], {"winner": {keys[1]: result[keys[1]]}, "loser": {keys[0]: result[keys[0]]}})
        elif values[0]["item"] == "scissors" and values[1]["item"] == "rock":
            await self.send_result(path, keys[1], keys[0], {"winner": {keys[1]: result[keys[1]]}, "loser": {keys[0]: result[keys[0]]}})
        elif values[0]["item"] == "scissors" and values[1]["item"] == "paper":
            await self.send_result(path, keys[0], keys[1], {"winner": {keys[0]: result[keys[0]]}, "loser": {keys[1]: result[keys[1]]}})

    
    async def send_result(self, path: str, winner: int, loser: int, result: dict, is_dead_heat=False): #result = {"winner": {keys[0]: {roomNumber: roomNumber, item: myChoice, user: currentUser}}, "loser": {keys[1]: {roomNumber: roomNumber, item: myChoice, user: currentUser}}}
        """
        Send message with result to websockets
        """
        clients = []
        for ws in self.manager.active_connections:
            if path == ws.get("path"):
                client = ws.get("client")[1]
                winner_item = result.get('winner').get(winner).get('item')
                loser_item = result.get('loser').get(loser).get('item')
                if not is_dead_heat: 
                    if client == winner:
                        await ws.send_json({"result": {
                                            "win": True,
                                            "winner_item": winner_item,
                                            "loser_item": loser_item,
                                            "result": result
                                            }})
                    elif client == loser:
                        await ws.send_json({"result": {
                                            "win": False,
                                            "winner_item": winner_item,
                                            "loser_item": loser_item,
                                            "result": result
                                            }})
                elif is_dead_heat:
                    await ws.send_json({"result": {
                        "win": False,
                        "winner_item": winner_item,
                        "loser_item": loser_item,
                        "result": result
                    }})
                    
                clients.append(ws)

        for ws in clients:
            self.save_result_to_db(is_dead_heat, result)
            await self.remove_readies(ws)
            await self.manager.disconnect(ws)

    
    def save_result_to_db(self, is_dead_heat: bool, result: dict[dict]): #  result = {"winner": {keys[0]: {roomNumber: roomNumber, item: myChoice, user: currentUser}}, "loser": {keys[1]: {roomNumber: roomNumber, item: myChoice, user: currentUser}}}
        """
        Save result to database. Changing room status
        """
        
        winner = list(result["winner"].keys())[0], #
        loser = list(result["loser"].keys())[0], #

        winner = winner[0]
        loser = loser[0]

        data = {
            "winner": winner, 
            "loser": winner, 
            "winner_item": result["winner"][winner]["item"],
            "loser_item": result["loser"][loser]["item"],
            "winner_id": result["winner"][winner]["user"]['id'],
            "loser_id": result["loser"][loser]["user"]['id'],
            "is_dead_heat": is_dead_heat,
            "room_number": result["winner"][winner]["roomNumber"],
        }

        room_id = data.get("room_number")
        if self.results.get(room_id) is None:
            self.results[room_id] = data
            print(result)
            print("SELF RESULTS IS NONE")
        else:
            print("SELF RESULTS IS NOT NONE")
            try:
                data_2 = self.results.get(room_id)
                winner_id = data.get('winner_id')
                loser_id = data_2.get('loser_id')
                room_id = UUID(room_id)
                winner_item = data.get('winner_item')
                loser_item = data.get('loser_item')
                crud.save_result(
                    SessionLocal(),
                    is_dead_heat,
                    winner_id,
                    loser_id,
                    winner_item,
                    loser_item,
                    room_id
                )
                crud.update_room_status_to_played(SessionLocal(), room_id, winner_id, loser_id)
            finally:
                self.results[room_id] = None