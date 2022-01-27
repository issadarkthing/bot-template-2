import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { commandManager } from "../index";

export default class Help extends Command {
  name = "help";
  aliases = ["h"];
  description = "show all commands and it's description";

  async exec(i: CommandInteraction) {
    const commands = commandManager.commands.values();

    let helpText = "";
    const done = new Set<string>();

    for (const command of commands) {

      if (command.disable)
        continue;

      if (done.has(command.name)) {
        continue
      } else {
        done.add(command.name);
      }

      helpText += 
        `\n**${command.name}**: \`${command.description || "none"}\``;

    }

    const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Help")
      .setDescription(helpText)

    i.reply({ embeds: [embed] });
  }
}
