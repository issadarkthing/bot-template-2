import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Armor } from "./Armor";
import { Weapon } from "./Weapon";
import { Pet } from "./Pet";
import { Skill } from "./Skill";

export abstract class Item {
  abstract name: string;
  abstract id: string;
  abstract price: number;
  abstract show(): EmbedBuilder;
  abstract buy(i: CommandInteraction): Promise<void>;
  static get all() {
    return [
      ...Armor.all,
      ...Weapon.all,
      ...Pet.all,
      ...Skill.all,
    ];
  }
}
