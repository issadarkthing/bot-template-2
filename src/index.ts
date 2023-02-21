import { Client } from "./structure/Client";
import path from "path";
import { config } from "dotenv";
import { CommandError, CommandManager } from "@jiman24/slash-commandment";

config();

export const client = new Client({ 
  intents: [
    "GuildMessages",
    "Guilds",
    "GuildMembers",
  ],
});

export const commandManager = new CommandManager({
  client,
  devGuildID: "899466085735223337",
  isDev: process.env.ENV === "DEV",
});

commandManager.verbose = true;

commandManager.handleCommandError((i, err) => {
  let errMsg = "There's an error occured";

  if (err instanceof CommandError) {
    errMsg = err.message;
  } else {
    console.log(err);
  }

  if (i.replied || i.deferred) {
    i.editReply(errMsg);
  } else {
    i.reply(errMsg);
  }
});

client.on("ready", () => { 
  commandManager.registerCommands(path.resolve(__dirname, "./commands"));
  console.log(client.user!.username, "is ready!");
})

  
client.on("interactionCreate", i => commandManager.handleInteraction(i));


client.login(process.env.BOT_TOKEN);
