import { 
  CommandInteraction, 
  Interaction, 
  Message, 
  MessageActionRow, 
  MessageEmbed, 
  MessageSelectMenu,
  SelectMenuInteraction,
} from "discord.js";

type CallBack = (i: SelectMenuInteraction) => void | Promise<void>;

export class SelectMenu {
  private i: CommandInteraction;
  private embed: MessageEmbed;
  private userID: string;
  private callBack?: CallBack;
  selectMenu: MessageSelectMenu;

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

    const msg = await this.i
      .editReply({ embeds: [this.embed], components: [row] }) as Message;

    return new Promise<void>((resolve) => {
        const filter = (i: Interaction) =>
        i.isSelectMenu() && i.user.id === this.userID;

        const collector = msg.createMessageComponentCollector({
          filter,
          max: 1,
        });

        collector.on("collect", async (collected: SelectMenuInteraction) => {
          if (this.callBack) {
            await this.callBack(collected);
            resolve();
          }
        })
    })
  }
}
