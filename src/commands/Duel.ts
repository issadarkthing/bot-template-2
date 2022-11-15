import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction } from "discord.js";
import { Player } from "../structure/Player";
import { bold, currency, validateAmount, validateNumber } from "../utils";
import { Battle } from "@jiman24/discordjs-rpg";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { oneLine, stripIndents } from "common-tags";

export default class extends Command {
  name = "duel";
  description = "duel with other person with bet";
  maxCount = 5;
  cooldownTime = 1; // hours

  constructor() {
    super();

    this.addIntegerOption(option => 
      option
        .setName("bet")
        .setDescription("amount to bet")
        .setMinValue(0)
        .setRequired(true)
    );

    this.addUserOption(option =>
      option
        .setName("user")
        .setDescription("user you want to challenge")
        .setRequired(true)
    )

  }

  async exec(i: CommandInteraction) {
    await i.deferReply();

    const player = await Player.fromUser(i.user);
    const amount = i.options.get("bet")?.value! as number;
    const mentionedUser = i.options.getUser("user")!;

    validateNumber(amount);
    validateAmount(amount, player.coins);

    let accept = false;

    const duelConfirmation = new ButtonHandler(
      i, 
      oneLine`${player.name} challenge into a duel for ${amount} ${currency}.
      Do you accept? ${mentionedUser}`,
      mentionedUser.id,
    );

    duelConfirmation.addButton("accept", () => { accept = true });
    duelConfirmation.addButton("reject", () => { accept = false });

    await duelConfirmation.run();

    if (!accept) {
      throw new Error(`${mentionedUser.username} rejected the duel challenge`);
    }

    const opponent = await Player.fromUser(mentionedUser);

    validateAmount(amount, opponent.coins);

    opponent.coins -= amount;
    player.coins -= amount;

    const battle = new Battle(i, [player, opponent]);
    const winner = (await battle.run()) as Player;
    const loser = player.id === winner.id ? opponent : player;

    winner.coins += amount * 2;

    winner.save();
    loser.save();

    i.editReply(
      stripIndents`${winner.name} wins over ${opponent.name}!
        ${winner.name} earns ${bold(amount * 2)} ${currency}
        ${loser.name} loses ${bold(amount)} ${currency}`
    );
  }
}
