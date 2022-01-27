import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction } from "discord.js";
import { Player } from "../structure/Player";

export default class extends Command {
  name = "profile";
  description = "show profile";
  aliases = ["p"];

  async exec(i: CommandInteraction) {
    const player = Player.fromUser(i.user);
    i.reply({ embeds: [player.show()] });
  }
}
