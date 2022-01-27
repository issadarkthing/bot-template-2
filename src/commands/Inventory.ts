import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Armor } from "../structure/Armor";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { DIAMOND, remove, toNList, validateNumber } from "../utils";
import { Skill } from "../structure/Skill";
import { SelectMenu } from "../structure/SelectMenu";
import { Item } from "../structure/Item";
import { ButtonMenu } from "../structure/ButtonMenu";


export default class extends Command {
  name = "inventory";
  description = "show player's inventory";
  aliases = ["i", "inv"];
  maxArmor = 4; // max equipped armor
  maxWeapon = 2; // max equipped weapon

  async exec(i: CommandInteraction) {


    const player = Player.fromUser(i.user);
    const inventoryList = toNList(
      player.inventory.map(item => {
        // show equipped item in the list with symbol so it is easier to
        // overview what item is in equipped
        const equippedName = `${DIAMOND} ${item.name}`;

        if (
          player.equippedWeapons.some(x => x.id === item.id) ||
          player.equippedArmors.some(x => x.id === item.id) ||
          player.pet?.id === item.id ||
          player.skill?.id === item.id
        ) {
          return equippedName;
        }


        return item.name;
      })
    );

    let footer = "\n---\n";

    footer += `${DIAMOND}: equipped/active`;

    const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Inventory")
      .setDescription(inventoryList + footer);

    await i.reply("Opening inventory");

    const menu = new SelectMenu(i, embed);

    for (const item of player.inventory) {
      menu.selectMenu.addOptions({
        label: item.name,
        value: item.id,
      })
    }

    let item!: Item;

    menu.onSelect(async menuInteraction => {
      item = player.inventory.find(x => x.id === menuInteraction.values[0])!;

      await menuInteraction.reply(`You've selected ${item.name}`);
      await menuInteraction.deleteReply();
    })

    await menu.run();

    const button = new ButtonMenu(i, item.show());

    if (item instanceof Armor) {

      if (player.equippedArmors.some(x => x.id === item.id)) {

        button.addButton("unequip", (i) => {

          player.equippedArmors = remove(item as Armor, player.equippedArmors);
          player.save();

          i.reply(`Successfully unequipped ${item.name}`);
        })

      } else {

        button.addButton("equip", (i) => {

          if (player.equippedArmors.length >= this.maxArmor) {
            throw new Error(`you cannot equip more than ${this.maxArmor} armor`);
          }

          player.equippedArmors.push(item as Armor);
          player.save();

          i.reply(`Successfully equipped ${item.name}`);

        })
      }

    } else if (item instanceof Weapon) {

      if (player.equippedWeapons.some(x => x.id === item.id)) {

        button.addButton("unequip", (i) => {

          player.equippedWeapons = remove(item as Weapon, player.equippedWeapons);
          player.save();

          i.reply(`Successfully unequipped ${item.name}`);
        })

      } else {

        button.addButton("equip", (i) => {

          if (player.equippedWeapons.length >= this.maxWeapon) {
            throw new Error(`you cannot equip more than ${this.maxWeapon} weapon`);
          }

          player.equippedWeapons.push(item as Weapon);
          player.save();

          i.reply(`Successfully equipped ${item.name}`);

        })
      }

    } else if (item instanceof Pet) {

      if (player.pet?.id === item.id) {

        button.addButton("deactivate", (i) => {

          player.pet = undefined;
          player.save();

          i.reply(`Successfully deactive ${item.name}`);
        })

      } else {

        button.addButton("activate", (i) => {

          (item as Pet).setOwner(player);
          player.save();

          i.reply(`Successfully make ${item.name} as active pet`);

        })
      }

    } else if (item instanceof Skill) {

      if (player.skill?.id === item.id) {

        button.addButton("deactivate", (i) => {

          player.skill = undefined;
          player.save();

          i.reply(`Successfully deactivated ${item.name}`);
        })

      } else {

        button.addButton("activate", (i) => {

          player.skill = item as Skill;
          player.save();

          i.reply(`Successfully activated ${item.name}`);

        })
      }

    }

    button.addCloseButton();

    await button.run()

  }
}
