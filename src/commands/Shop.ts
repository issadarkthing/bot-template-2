import { CommandInteraction, MessageEmbed } from "discord.js";
import { 
  currency, 
  code, 
  toNList, 
  validateIndex, 
  validateNumber,
  getMessage, 
} from "../utils";
import { Armor } from "../structure/Armor";
import { Command } from "@jiman24/slash-commandment";
import { ButtonHandler } from "@jiman24/discordjs-button";
import { Item } from "../structure/Item";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { Skill } from "../structure/Skill";
import { cap } from "@jiman24/discordjs-utils";
import { SelectMenu } from "../structure/SelectMenu";

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
        .setRequired(true)
        .addChoice("armor", "armor")
        .addChoice("weapon", "weapon")
        .addChoice("pet", "pet")
        .addChoice("skill", "skill")
    )

    this.addIntegerOption(option => 
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
    let items = [] as Item[];

    switch (arg1) {
      case "armor": items = Armor.all; break;
      case "weapon": items = Weapon.all; break;
      case "pet": items = Pet.all; break;
      case "skill": items = Skill.all; break;
    }


    let [itemList] = this.toList(items);
    const category = Object.getPrototypeOf(items[0].constructor).name.toLowerCase();
    const shopName = `${cap(category)} Shop`;
    const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle(shopName)
      .setDescription(itemList)

    i.reply(`Opening ${shopName}`);

    const menu = new SelectMenu(i, embed, i.user.id);

    for (const item of items) {
      menu.selectMenu.addOptions({
        label: item.name,
        value: item.name,
      })
    }

    menu.onSelect(async menuInteraction => {
      const value = menuInteraction.values[0];
      const item = items.find(x => x.name === value)!;

      const info = item.show();
      const msg = await getMessage(i);
      const menu = new ButtonHandler(msg, info, i.user.id);

      i.deferReply();

      menu.addButton("buy", () => {
        return item.buy(msg);
      })

      menu.addCloseButton();

      await menu.run();

      menuInteraction.reply(`You selected ${value}`);
    });

    await menu.run();

  }
}
