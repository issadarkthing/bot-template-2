import { 
  CommandInteraction, 
  Interaction, 
  MessageActionRow, 
  MessageEmbed, 
  MessageSelectMenu,
  SelectMenuInteraction,
} from "discord.js";

type CallBack = (i: SelectMenuInteraction) => void | Promise<void>;

export class SelectMenu {
  i: CommandInteraction;
  embed: MessageEmbed;
  selectMenu: MessageSelectMenu;
  userID: string;
  callBack?: CallBack;

  constructor(i: CommandInteraction, embed: MessageEmbed | string, userID?: string) {
    this.i = i;
    this.userID = userID || i.user.id;
    this.embed = new MessageEmbed();
    this.selectMenu = new MessageSelectMenu()
      .setCustomId("sample")
      .setPlaceholder("Please choose an option");

    if (embed instanceof MessageEmbed) {
      this.embed = new MessageEmbed(embed);
    } else if (typeof embed === "string") {
      const newEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(embed);

      this.embed = newEmbed;
    }
  }

  onSelect(cb: CallBack) {
    this.callBack = cb;
  }

  async run() {

    const row = new MessageActionRow()
      .addComponents(this.selectMenu);

    const msg = await this.i.channel!
      .send({ embeds: [this.embed], components: [row] });

    return new Promise<void>((resolve) => {
        const filter = (i: Interaction) =>
        i.isSelectMenu() && i.user.id === this.userID;

        const collector = msg.createMessageComponentCollector({
          filter,
          max: 1,
        });

        collector.on("collect", async (collected: SelectMenuInteraction) => {
          this.callBack && this.callBack(collected);
          await msg.delete();
          resolve();
        })
    })
  }
}
