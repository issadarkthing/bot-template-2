import { CommandInteraction, MessageEmbed } from "discord.js";
import { 
  currency, 
  code, 
  toNList, 
  validateIndex, 
  validateNumber, 
} from "../utils";
import { Armor } from "../structure/Armor";
import { Command } from "@jiman24/slash-commandment";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { stripIndents } from "common-tags";
import { Item } from "../structure/Item";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { Skill } from "../structure/Skill";

interface ItemLike {
  name: string;
  price: number;
}

export default class extends Command {
  name = "shop";
  description = "buy in-game items";

  constructor() {
    super();

    this.addStringOption(option => 
      option
        .setName("type")
        .setDescription("shop type")
        .addChoice("armor", "armor")
        .addChoice("weapon", "weapon")
        .addChoice("pet", "pet")
        .addChoice("skill", "skill")
    )

    this.addNumberOption(option => 
      option
        .setName("index")
        .setDescription("item index")
    )
  }

  private toList(items: ItemLike[], start = 1) {
    const list = toNList(
      items.map(x => `${x.name} ${code(x.price)} ${currency}`),
      start,
    );

    const lastIndex = (items.length - 1) + start;
    return [list, lastIndex] as const;
  }

  async exec(i: CommandInteraction) {

    const arg1 = i.options.getString("type");
    const arg2 = i.options.getInteger("index");

    if (arg1) {
    
      let items = [] as Item[] | null;

      switch (arg1) {
        case "armor": items = Armor.all; break;
        case "weapon": items = Weapon.all; break;
        case "pet": items = Pet.all; break;
        case "skill": items = Skill.all; break;
        default: items = null;
      }

      if (!items) {
        throw new Error("invalid category");
      }

      const msg = await i.channel!.send("executing");

      if (arg2) {

        const index = arg2 - 1;

        validateNumber(index);
        validateIndex(index, items);

        const selected = items[index];

        const info = selected.show();
        const menu = new ButtonHandler(msg, info);

        menu.addButton("buy", () => {
          return selected.buy(msg);
        })

        menu.addCloseButton();

        await menu.run();

        return;

      } else {

        let [itemList] = this.toList(items);
        const category = Object.getPrototypeOf(items[0].constructor).name.toLowerCase();


        const embed = new MessageEmbed()
          .setColor("RANDOM")
          .setTitle(`${category} Shop`)
          .setDescription(itemList)

        msg.channel.send({ embeds: [embed] });

        return;
      }
    }

    const rpgList = stripIndents`
      **Categories**
      armor
      weapon
      pet
      skill
      `;

      const shop = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Shop")
      .setDescription(rpgList);

    i.reply({ embeds: [shop] });

  }
}
