import { Command } from "@jiman24/slash-commandment";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Armor } from "../structure/Armor";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Player } from "../structure/Player";
import { DIAMOND, remove, toNList, validateNumber } from "../utils";
import { Skill } from "../structure/Skill";


export default class extends Command {
  name = "inventory";
  description = "show player's inventory";
  aliases = ["i", "inv"];
  maxArmor = 4; // max equipped armor
  maxWeapon = 2; // max equipped weapon

  constructor() {
    super();

    this.addNumberOption(option =>
      option
        .setName("index")
        .setDescription("item index")
    )
  }

  async exec(i: CommandInteraction) {

    try {

      const player = Player.fromUser(i.user);
      const arg1 = i.options.getInteger("index");

      if (arg1 !== null) {

        const index = arg1 - 1;

        validateNumber(index);

        const item = player.inventory[index];

        if (!item) {
          i.reply("cannot find item");
          return;
        }

        const msg = await i.channel!.send("executing");
        const menu = new ButtonHandler(msg, item.show());

        if (item instanceof Armor) {

          if (player.equippedArmors.some(x => x.id === item.id)) {
            
            menu.addButton("unequip", () => {

              player.equippedArmors = remove(item, player.equippedArmors);
              player.save();

              msg.channel.send(`Successfully unequipped ${item.name}`);
            })

          } else {

            menu.addButton("equip", () => {

              if (player.equippedArmors.length >= this.maxArmor) {
                throw new Error(`you cannot equip more than ${this.maxArmor} armor`);
              }

              player.equippedArmors.push(item);
              player.save();

              msg.channel.send(`Successfully equipped ${item.name}`);

            })
          }

        } else if (item instanceof Weapon) {

          if (player.equippedWeapons.some(x => x.id === item.id)) {
            
            menu.addButton("unequip", () => {

              player.equippedWeapons = remove(item, player.equippedWeapons);
              player.save();

              msg.channel.send(`Successfully unequipped ${item.name}`);
            })

          } else {

            menu.addButton("equip", () => {

              if (player.equippedWeapons.length >= this.maxWeapon) {
                throw new Error(`you cannot equip more than ${this.maxWeapon} weapon`);
              }

              player.equippedWeapons.push(item);
              player.save();

              msg.channel.send(`Successfully equipped ${item.name}`);

            })
          }

        } else if (item instanceof Pet) {

          if (player.pet?.id === item.id) {

            menu.addButton("deactivate", () => {

              player.pet = undefined;
              player.save();

              msg.channel.send(`Successfully deactive ${item.name}`);
            })

          } else {

            menu.addButton("activate", () => {

              item.setOwner(player);
              player.save();

              msg.channel.send(`Successfully make ${item.name} as active pet`);

            })
          }

        } else if (item instanceof Skill) {

          if (player.skill?.id === item.id) {
            
            menu.addButton("deactivate", () => {

              player.skill = undefined;
              player.save();

              msg.channel.send(`Successfully deactivated ${item.name}`);
            })

          } else {

            menu.addButton("activate", () => {

              player.skill = item;
              player.save();

              msg.channel.send(`Successfully activated ${item.name}`);

            })
          }

        }

        menu.addCloseButton();
        await menu.run();

        return;
      }

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

      i.reply({ embeds: [embed] });

    } catch (err) {
      i.reply((err as Error).message);
    }
  }
}
