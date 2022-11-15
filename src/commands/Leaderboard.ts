import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { client } from "../index";
import { bold, currency } from "../utils";

export default class extends Command {
  name = "leaderboard";
  aliases = ["l"];
  description = "show leaderboard of rich players";

  async exec(i: CommandInteraction) {

    const player = client.players.array()
      .sort((a, b) => b.coins - a.coins)
      .map((x, i) => `${i + 1}. ${x.name} \`${x.coins}\``)
      .slice(0, 10)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("Leaderboard")
      .setDescription(bold(`Name | ${currency}\n`) + player);

    i.reply({ embeds: [embed] });
  }
}

