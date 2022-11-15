import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction } from "discord.js";
import { Player } from "../structure/Player";
import { Battle } from "@jiman24/discordjs-rpg";
import { Monster } from "../structure/Monster";
import { bold, currency, getMessage, random } from "../utils";
import { ButtonHandler } from "@jiman24/discordjs-button";

export default class extends Command {
  name = "hunt";
  description = "start hunting";
  block = true;

  async exec(i: CommandInteraction) {

    await i.reply("Hunting..");

    const msg = await getMessage(i);
    const player = await Player.fromUser(i.user);

    let monster = new Monster(player);
    let search = new ButtonHandler(i, monster.show());
    let isBattle = false;

    search.addButton("battle", () => {
      isBattle = true;
    })
      
    search.addCloseButton();

    await search.run();

    if (isBattle) {

      await i.editReply("Battle start");
      const battle = new Battle(i, random.shuffle([player, monster]));
      battle.interval = process.env.ENV === "DEV" ? 1000 : 3000;
      const winner = await battle.run();
      player.hunt++;

      if (winner.id === player.id) {

        const currLevel = player.level;
        player.addXP(monster.xpDrop);
        player.coins += monster.drop;
        player.win++;

        msg.channel.send(`${player.name} has earned ${bold(monster.drop)} ${currency}!`);
        msg.channel.send(`${player.name} has earned ${bold(monster.xpDrop)} xp!`);

        if (currLevel !== player.level) {
          msg.channel.send(`${player.name} is now on level ${bold(player.level)}!`);
        }

      } 

      player.save();
    }

  }
}
