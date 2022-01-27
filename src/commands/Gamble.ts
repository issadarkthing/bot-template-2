import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction } from "discord.js";
import { Player } from "../structure/Player";
import { random, validateAmount, validateNumber } from "../utils";

export default class extends Command {
  name = "gamble";
  description = "slot machine game";
  symbols = ["🔵", "🔴", "⚪"];
  throttle = 60 * 1000;

  constructor() {
    super();

    this.addIntegerOption(option => 
      option
        .setName("bet")
        .setDescription("amount to bet")
        .setMinValue(1)
        .setRequired(true)
    )
  }

  private allEqual(arr: string[]) {
    return arr.every(x => x === arr[0]);
  }

  private getColumn(index: number, arr: string[][]) {
    return arr.map(x => x[index]);
  }

  private getCrosses(arr: string[][]) {
    return [
      [arr[0][0], arr[1][1], arr[2][2]],
      [arr[0][2], arr[1][1], arr[2][0]],
    ];
  }

  async exec(i: CommandInteraction) {

    const amount = i.options.getInteger("bet")!;
    const player = Player.fromUser(i.user);
    const msg = await i.channel!.send("executing");

    validateNumber(amount);
    validateAmount(amount, player.coins);

    const rows = Array(3)
      .fill(null)
      .map(() => Array(3).fill(null).map(() => random.pick(this.symbols)));

    let multiplier = 1;

    // row check
    for (const row of rows) {
      if (this.allEqual(row)) {
        multiplier++;
      }
    }

    // column check
    for (let i = 0; i < rows.length; i++) {
      const column = this.getColumn(i, rows);

      if (this.allEqual(column)) {
        multiplier++;
      }
    }

    // cross check
    for (const row of this.getCrosses(rows)) {
      if (this.allEqual(row)) {
        multiplier++;
      }
    }

    const result = rows
      .map(x => "**|** " + x.join("") + " **|**")
      .join("\n");

    i.reply(result);

    player.coins -= amount;

    if (multiplier === 1) {
      msg.channel.send(`You lost **${amount}** coins!`);

    } else {
      const winAmount = multiplier * amount;
      player.coins += winAmount;
      msg.channel.send(`You won **(x${multiplier}) ${winAmount}** coins!`);

    }

    player.save();
  }
}
