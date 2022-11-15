import { Client } from "./structure/Client";
import path from "path";
import { config } from "dotenv";
import { CommandManager } from "@jiman24/slash-commandment";

config();

export const client = new Client({ 
  intents: [
    "GuildMessages",
    "Guilds",
    "GuildMembers",
  ],
});

export let commandManager: CommandManager; 

client.on("ready", () => { 
  commandManager = new CommandManager({
    client,
    devGuildID: "899466085735223337",
  })

  commandManager.verbose = true;
  commandManager.registerCommands(path.resolve(__dirname, "./commands"));

  client.on("interactionCreate", i => commandManager.handleInteraction(i));

  console.log(client.user!.username, "is ready!");
})


client.login(process.env.BOT_TOKEN);
