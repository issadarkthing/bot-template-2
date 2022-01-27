import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Player } from "../structure/Player";
import { Battle } from "@jiman24/discordjs-rpg";
import { Monster } from "../structure/Monster";
import { bold, currency, getMessage, random } from "../utils";
import { ButtonMenu } from "../structure/ButtonMenu";

class SearchMonster extends ButtonMenu {
  player: Player;

  constructor(i: CommandInteraction, embed: MessageEmbed | string, player: Player) {
    super(i, embed);
    this.player = player;
  }

  async search(cb: (monster: Monster) => Promise<void>) {

    const monster = new Monster(this.player);
    const button = new ButtonMenu(this.i, monster.show())

    button.addButton("next", async (btn) => { 
      const search = new SearchMonster(this.i, "", this.player);
      await search.search(cb);
    })

    button.addButton("battle", async (btn) => { 
      await btn.reply(`found ${monster.name}`);
      cb(monster);
    })

    button.addCloseButton();

    await button.run();
  }
}

export default class extends Command {
  name = "hunt";
  description = "start hunting";
  block = true;

  async exec(i: CommandInteraction) {

    await i.reply("Hunting..");

    const msg = await getMessage(i);
    const player = Player.fromUser(i.user);

    let monster = new Monster(player);
    let search = new ButtonMenu(i, monster.show());
    let isBattle = false;

    search.addButton("battle", async (btn) => {
      await btn.reply("Battle start");
      isBattle = true;
    })
      
    search.addCloseButton();

    await search.run();

    if (isBattle) {

      const battle = new Battle(msg, random.shuffle([player, monster]));
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
