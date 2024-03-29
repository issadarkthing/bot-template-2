import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { Battle } from "@jiman24/discordjs-rpg";
import { currency, random, validateAmount } from "../utils";
import { oneLine } from "common-tags";

export default class extends Command {
  name = "battle-royale";
  description = "fight multiple people at once and last one standing wins";
  aliases = ["br"];
  maxPlayers = 5;
  fee = 10;

  async exec(i: CommandInteraction) {
    await i.deferReply();

    const players = [] as Player[];

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("Battle Royale")
      .setDescription(
        oneLine`Battle Royale event has started. Waiting for ${this.maxPlayers}
        players. Battle fee is ${this.fee} ${currency}`
      );

    const msg = await i.channel!.send("Starting battle in 1 min...");

    const menu = new ButtonHandler(i, embed)
      .setMultiUser(this.maxPlayers);

    menu.addButton("join", async user => {
      try {

        const player = await Player.fromUser(user);

        validateAmount(this.fee, player.coins);

        player.coins -= this.fee;
        player.save();

        players.push(player);

        await msg.edit(
          `${user.username} joined! (${players.length}/${this.maxPlayers} players)`
        );

      } catch (err) {
        const errMsg = (err as Error).message;
        msg.channel.send(`${user} ${errMsg}`);
      }
    })

    await menu.run();

    if (players.length <= 1) {
      throw new Error("cannot start Battle Royale with 1 person or less");
    }
    
    const battle = new Battle(i, random.shuffle(players));

    const winner = (await battle.run()) as Player;
    const reward = this.fee * players.length;

    winner.coins += reward;
    winner.save();

    await msg.edit(
      `${winner.name} has won the Battle Royale and wins ${reward} ${currency}!`
    );

  }
}
