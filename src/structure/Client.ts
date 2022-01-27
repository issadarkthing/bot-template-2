import { Client as DiscordClient } from "discord.js";
import Enmap from "enmap";

export class Client extends DiscordClient {
  players = new Enmap("Player");
}
