import { 
  CommandInteraction, 
  MessageComponentInteraction, 
  Message, 
  ActionRowBuilder, 
  EmbedBuilder, 
  SelectMenuBuilder,
  SelectMenuInteraction,
} from "discord.js";

type CallBack = (i: SelectMenuInteraction) => void | Promise<void>;

export class SelectMenu {
  private i: CommandInteraction;
  private embed: EmbedBuilder;
  private userID: string;
  private callBack?: CallBack;
  selectMenu: SelectMenuBuilder;

  constructor(i: CommandInteraction, embed: EmbedBuilder | string, userID?: string) {
    this.i = i;
    this.userID = userID || i.user.id;
    this.embed = new EmbedBuilder();
    this.selectMenu = new SelectMenuBuilder()
      .setCustomId("sample")
      .setPlaceholder("Please choose an option");

    if (embed instanceof EmbedBuilder) {
      this.embed = new EmbedBuilder(embed.data);
    } else if (typeof embed === "string") {
      const newEmbed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(embed);

      this.embed = newEmbed;
    }
  }

  onSelect(cb: CallBack) {
    this.callBack = cb;
  }

  async run() {

    const row = new ActionRowBuilder<SelectMenuBuilder>()
      .addComponents(this.selectMenu);

    const msg = await this.i
      .editReply({ embeds: [this.embed], components: [row] }) as Message;

    return new Promise<void>((resolve) => {
        const filter = (x: unknown) => {
          const i = x as MessageComponentInteraction;
          return i.isSelectMenu() && i.user.id === this.userID;
        }

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
