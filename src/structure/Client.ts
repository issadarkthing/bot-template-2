import { Client as DiscordClient } from "discord.js";
import Josh from "@joshdb/core";
//@ts-ignore
import provider from "@joshdb/sqlite";

export class Client extends DiscordClient {
  players = new Josh({
    name: "players",
    provider,
  })
}
