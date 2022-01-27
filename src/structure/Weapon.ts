import { Weapon as BaseWeapon } from "@jiman24/discordjs-rpg";
import { ButtonInteraction } from "discord.js";
import { Player } from "../structure/Player";

export abstract class Weapon extends BaseWeapon {
  abstract price: number;

  static get all(): Weapon[] {
    return [
      new Axe(),
      new Sword(),
      new Dagger(),
      new Mace(),
    ];
  }

  async buy(i: ButtonInteraction) {

    const player = Player.fromUser(i.user);

    if (player.coins < this.price) {
      await i.reply("Insufficient amount");
      return;
    }

    if (
      player.inventory.some(x => x.id === this.id) ||
      player.equippedWeapons.some(x => x.id === this.id)
    ) {
      await i.reply("You already own this item");
      return;
    }

    player.coins -= this.price;
    player.inventory.push(this);

    player.save();
    await i.reply(`Successfully bought **${this.name}**`);
  }
}


class Axe extends Weapon {
  id = "axe";
  name = "Axe";
  attack = 20;
  price = 1000;
}

class Sword extends Weapon {
  id = "sword";
  name = "Sword";
  attack = 30;
  price = 2000;
}

class Dagger extends Weapon {
  id = "dagger";
  name = "Dagger";
  attack = 40;
  price = 3000;
}

class Mace extends Weapon {
  id = "mace";
  name = "Mace";
  attack = 45;
  price = 3500;
}

class Blaster extends Weapon {
  id = "blaster";
  name = "Blaster";
  attack = 50;
  price = 4000;
}
