import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Armor } from "../structure/Armor";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { DIAMOND, remove, toNList } from "../utils";
import { Skill } from "../structure/Skill";
import { SelectMenu } from "../structure/SelectMenu";
import { Item } from "../structure/Item";


export default class extends Command {
  name = "inventory";
  description = "show player's inventory";
  aliases = ["i", "inv"];
  maxArmor = 4; // max equipped armor
  maxWeapon = 2; // max equipped weapon

  async exec(i: CommandInteraction) {

    const player = await Player.fromUser(i.user);
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

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("Inventory")
      .setDescription(inventoryList + footer);

    await i.reply("Opening inventory");

    const channel = i.channel!;
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

    const button = new ButtonHandler(i, item.show());

    if (item instanceof Armor) {

      if (player.equippedArmors.some(x => x.id === item.id)) {

        button.addButton("unequip", () => {

          player.equippedArmors = remove(item as Armor, player.equippedArmors);
          player.save();

          channel.send(`Successfully unequipped ${item.name}`);
        })

      } else {

        button.addButton("equip", () => {

          if (player.equippedArmors.length >= this.maxArmor) {
            throw new Error(`you cannot equip more than ${this.maxArmor} armor`);
          }

          player.equippedArmors.push(item as Armor);
          player.save();

          channel.send(`Successfully equipped ${item.name}`);
        })
      }

    } else if (item instanceof Weapon) {

      if (player.equippedWeapons.some(x => x.id === item.id)) {

        button.addButton("unequip", () => {

          player.equippedWeapons = remove(item as Weapon, player.equippedWeapons);
          player.save();

          channel.send(`Successfully unequipped ${item.name}`);
        })

      } else {

        button.addButton("equip", () => {

          if (player.equippedWeapons.length >= this.maxWeapon) {
            throw new Error(`you cannot equip more than ${this.maxWeapon} weapon`);
          }

          player.equippedWeapons.push(item as Weapon);
          player.save();

          channel.send(`Successfully equipped ${item.name}`);
        })
      }

    } else if (item instanceof Pet) {

      if (player.pet?.id === item.id) {

        button.addButton("deactivate", () => {

          player.pet = undefined;
          player.save();

          channel.send(`Successfully deactive ${item.name}`);
        })

      } else {

        button.addButton("activate", () => {

          (item as Pet).setOwner(player);
          player.save();

          channel.send(`Successfully make ${item.name} as active pet`);

        })
      }

    } else if (item instanceof Skill) {

      if (player.skill?.id === item.id) {

        button.addButton("deactivate", () => {

          player.skill = undefined;
          player.save();

          channel.send(`Successfully deactivated ${item.name}`);
        })

      } else {

        button.addButton("activate", () => {

          player.skill = item as Skill;
          player.save();

          channel.send(`Successfully activated ${item.name}`);
        })
      }

    }

    button.addCloseButton();

    await button.run()

  }
}
