<div align="center">
<h1>LightsaberBot Reborn</h1>

<img src="https://img.shields.io/github/v/tag/can-aslan/LightsaberBot-Reborn?color=l&label=version">
<img src="https://img.shields.io/github/issues/can-aslan/LightsaberBot-Reborn?label=known%20issues">
<img src="https://img.shields.io/github/commit-activity/w/can-aslan/LightsaberBot-Reborn">
<img src="https://img.shields.io/github/license/can-aslan/LightsaberBot-Reborn">
  
### Custom Discord bot in NodeJS (work in progress). New version of the Java based Lightsaber Bot.
</div>

# Commands
## Essential Functionality Commands
| Command | Description |
| :--- | :--- |
| `L!help` | Displays the list of commands. |
| `L!lightsaber` | Introduction. |

## Exchange Rate Related Commands
| Command | Description |
| :--- | :--- |
| `L!exc` | Displays the latest accessible `USD`, `EUR` and `GBP` to `TRY` exchange rates. |
| `L!exc list` | Lists the supported currencies for displaying the exchange rates with `TRY`. |
| `L!exc <CURRENCY>` | Displays the latest accessible `CURRENCY` to `TRY` exchange rate. |
| `L!exc <CURRENCY> <AMOUNT>` | Displays the latest accessible `<AMOUNT>` `TRY` in `<CURRENCY>`. |
| `L!exc2 <CURRENCY1> <CURRENCY2>` | Displays the latest accessible `<CURRENCY1>` to `<CURRENCY2>` exchange rate. |

## VATSIM Network Related Commands
| Command | Description |
| :--- | :--- |
| `L!track <CALLSIGN>` | Access to live tracking of the latest accessible pilot information of VATSIM flight with callsign `<CALLSIGN>`. |
| `L!pilot <VATSIMID>` | Displays the latest accessible pilot information of VATSIM pilot with ID `<VATSIMID>`. |
| `L!flight <CALLSIGN>` | Displays the latest accessible active flight information of VATSIM flight with callsign `<CALLSIGN>`. |

## "/" Commands
| Command | Description |
| :--- | :--- |
| `/echo` | Echoes your message. |
| `/pingus` | Replies with Pongus! |

# Features
+ Randomly changing embed colors to represens StarWars lightsaber colors.
+ Activity changes in 30s intervals to different StarWars related themes.
+ Emoji reactions to embedded messages.
+ Access to various currency/exchange related functionalities.
+ Access to live VATSIM network flight information via commands.


