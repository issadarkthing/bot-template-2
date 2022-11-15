import { Command, CommandError } from "@jiman24/slash-commandment";
import { CommandInteraction, EmbedBuilder } from "discord.js";
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
    await i.deferReply();

    const player = Player.fromUser(i.user);
    const boss = Boss.all;
      
    const channel = i.channel!;
    let index = i.options.get("index")?.value as number;
    
    if (index != undefined) {
      index--;

      validateNumber(index)
      validateIndex(index, boss);

      const selectedBoss = boss[index];
      const menu = new ButtonHandler(i, selectedBoss.show());

      let isBattle = false;

      menu.addButton("battle", async () => {
        isBattle = true;
      })

      menu.addCloseButton();

      await menu.run();

      if (!isBattle) {
        throw new CommandError();
      }

      const battle = new Battle(i, random.shuffle([player, selectedBoss]));
      const winner = await battle.run();

      if (winner.id === player.id) {

        const { drop, xpDrop } = selectedBoss;

        const currLevel = player.level;
        player.addXP(xpDrop);
        player.coins += drop;
        player.win++;

        channel.send(`${player.name} has earned ${bold(drop)} ${currency}!`);
        channel.send(`${player.name} has earned ${bold(xpDrop)} xp!`);

        if (currLevel !== player.level) {
          channel.send(`${player.name} is now on level ${bold(player.level)}!`);
        }
      }

      return;
    }

    const bossList = toNList(boss.map(x => x.name));

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Boss")
      .setDescription(bossList)

    i.editReply({ embeds: [embed] });
  }
}
