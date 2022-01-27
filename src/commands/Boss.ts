import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Boss } from "../structure/Boss";
import { Player } from "../structure/Player";
import { 
  bold, 
  currency, 
  random, 
  toNList, 
  validateIndex, 
  validateNumber,
} from "../utils";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Battle } from "@jiman24/discordjs-rpg";

export default class extends Command {
  name = "boss";
  description = "fight boss";

  constructor() {
    super();

    this.addIntegerOption(option =>
      option
        .setName("index")
        .setDescription("boss index")
    )
  }

  async exec(i: CommandInteraction) {

    const player = Player.fromUser(i.user);
    const boss = Boss.all;
      
    const msg = await i.channel!.send("executing");
    
    const index = i.options.getInteger("index");
    
    if (index) {

      validateNumber(index)
      validateIndex(index, boss);

      const selectedBoss = boss[index];
      const menu = new ButtonHandler(msg, selectedBoss.show());

      menu.addButton("battle", async () => {

        const battle = new Battle(msg, random.shuffle([player, selectedBoss]));

        const winner = await battle.run();

        if (winner.id === player.id) {

          const { drop, xpDrop } = selectedBoss;

          const currLevel = player.level;
          player.addXP(xpDrop);
          player.coins += drop;
          player.win++;

          msg.channel.send(`${player.name} has earned ${bold(drop)} ${currency}!`);
          msg.channel.send(`${player.name} has earned ${bold(xpDrop)} xp!`);

          if (currLevel !== player.level) {
            msg.channel.send(`${player.name} is now on level ${bold(player.level)}!`);
          }
        }
      })

      menu.addCloseButton();

      await menu.run();

      return;
    }

    const bossList = toNList(boss.map(x => x.name));

    const embed = new MessageEmbed()
      .setColor("RED")
      .setTitle("Boss")
      .setDescription(bossList)

    i.reply({ embeds: [embed] });
  }
}
