import { CommandInteraction, EmbedBuilder } from "discord.js";
import { 
  currency, 
  code, 
  toNList, 
} from "../utils";
import { Armor } from "../structure/Armor";
import { Command } from "@jiman24/slash-commandment";
import { Item } from "../structure/Item";
import { Weapon } from "../structure/Weapon";
import { Pet } from "../structure/Pet";
import { Skill } from "../structure/Skill";
import { cap } from "@jiman24/discordjs-utils";
import { SelectMenu } from "../structure/SelectMenu";
import { ButtonHandler } from "@jiman24/discordjs-button";

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
        .addChoices(
          { name: "armor", value: "armor" },
          { name: "weapon", value: "weapon" },
          { name: "pet", value: "pet" },
          { name: "skill", value: "skill" },
        )
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

    const arg1 = i.options.get("type", true)?.value as string;
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
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(shopName)
      .setDescription(itemList)

    const menu = new SelectMenu(i, embed);

    for (const item of items) {
      menu.selectMenu.addOptions({
        label: item.name,
        value: item.name,
      })
    }

    await i.reply("Opening shop");

    let value: string;

    menu.onSelect(async menuInteraction => {
      value = menuInteraction.values[0];

      await menuInteraction.reply(`You've selected ${value}`);
      await menuInteraction.deleteReply();
    });

    await menu.run();

    const item = items.find(x => x.name === value)!;
    const info = item.show();
    const button = new ButtonHandler(i, info);

    let isBuy = false;

    button.addButton("buy", () => {
      isBuy = true;
    })

    button.addCloseButton();

    await button.run();

    if (!isBuy) {
      return;
    }

    await item.buy(i);
  }
}
