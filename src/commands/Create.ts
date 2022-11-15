import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction } from "discord.js";
import { client } from "../index";
import { bold } from "../utils";
import { Player } from "../structure/Player";

export default class extends Command {
  name = "create";
  description = "create new character";

  async exec(i: CommandInteraction) {

    if (await client.players.has(i.user.id)) {
      throw new Error("your character has already been created");
    }


    const avatarUrl = i.user.avatarURL() || i.user.defaultAvatarURL;
    const player = new Player(i.user, avatarUrl);

    player.save();


    i.reply(`${bold(player.name)} has been created successfully!`);
    i.channel?.send(
      `Use \`/profile\` to checkout your profile`
    )
    i.channel?.send(`Use \`/hunt\` to start hunting monsters!`);
    i.channel?.send(`Use \`/help\` to check out other commands!`);
  }
}
