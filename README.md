# Note
> <strong> This bot is still under development and might not have all the features you'd be looking for. </strong>

## Setting up config file
Place this file in `src` folder and name it `config.json`: 
```json
{
    "tokens": [
        "token1",
        "token2",
        "..."
    ],
    "owners": [
        "owner1",
        "owner2",
        "..."
    ],
    "geniusAccessToken": "genius api access token",
    "supportGuildID": "main guild id",
    "lavalink": {
        "nodes": [
            {
                "name": "name for the node",
                "port": 2333,
                "ip": "lavalink server ip",
                "password": "youshallnotpass"
            }
        ]
    }
}
```
- You need an access token from genius site to get track lyrics.
- The port might need to be updated accordingly depending on the port your lavalink server is listening to.
- You can add more nodes by expanding the array.

## Running The Bot
- Before anything, do `npm install` to install all dependencies.
- Then Simply run `npm run bot` and everything should work. 

## Bash Commands 
> You can use a set of commands during runtime to restart or kill bots:
```json
{
    "type": "kill",
    "index": 0
}
```
> Kills a bot at given index.
```json 
{
    "type": "killAll"
}
```
> Will kill all bots, also exits the node.js process.
```json
{
    "type": "respawn",
    "index": 0
}
```
> Will respawn bot at given index.
```json
{
    "type": "respawnAll"
}
```
> Will respawn all bots, this will kill the current processes first if found.