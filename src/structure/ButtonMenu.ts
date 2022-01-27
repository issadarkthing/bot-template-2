import {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  MessageComponentInteraction,
  User,
  InteractionCollector,
  CommandInteraction,
  ButtonInteraction,
  Message,
} from "discord.js";
import crypto from "crypto";

interface Button {
  id: string;
  label: string;
  callback: (btn: ButtonInteraction) => void | Promise<void>;
}

type ButtonCallback = Button["callback"];

const GLOBAL_BUTTONS: Button[] = [];

export class ButtonMenu {
  protected i: CommandInteraction;
  private userID: string;
  private embed: MessageEmbed;
  private buttons: Button[] = [];
  private timeout = 60_000;
  private maxUser = 1;
  private users?: string[];
  private clickedUsers = new Map<string, number>();
  private max = 1;
  private id = this.uuid();
  private filter?: (user: User) => boolean;
  private collector?: InteractionCollector<MessageComponentInteraction>;

  constructor(i: CommandInteraction, embed: MessageEmbed | string, userID?: string) {
    this.i = i;
    this.userID = userID || i.user.id;
    this.embed = new MessageEmbed();

    if (embed instanceof MessageEmbed) {
      this.embed = new MessageEmbed(embed);
    } else if (typeof embed === "string") {
      const newEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(embed);

      this.embed = newEmbed;
    }
  }

  private uuid() {
    return crypto.randomBytes(16).toString("hex");
  }

  private labelToID(label: string) {
    return `${this.id}-` + label.replace(/\s+/, "") + `-${this.uuid()}`;
  }

  private getButtonHandlerID(id: string) {
    return id.split("-")[0];
  }

  private isMultiUser() {
    return this.maxUser !== 1;
  }

  /** set custom filter */
  setFilter(cb: (user: User) => boolean) {
    this.filter = cb;
    return this;
  }

  /** set selected amount user can click. 1 by default. */
  setUsers(ids: string[]) {
    this.users = ids;
    return this;
  }

  /** set max number of users can click. (1 button click per user by default) */
  setMultiUser(max: number) {
    this.maxUser = max;
    return this;
  }

  /** set button timeout */
  setTimeout(ms: number) {
    this.timeout = ms;
    return this;
  }

  /** set max button click per user */
  setMax(max: number) {
    this.max = max;
    return this;
  }

  /** async reset embed. This method only works for single user and single click */
  setEmbed(embed: MessageEmbed) {
    this.embed = embed;
    this.close();
    this.clickedUsers.delete(this.userID);
    this.run();
  }

  /** adds button */
  addButton(label: string, callback: ButtonCallback) {
    const id = this.labelToID(label);
    const button = {
      id,
      label,
      callback,
    }

    this.buttons.push(button);
    GLOBAL_BUTTONS.push(button);

    return this;
  }

  /** add generic cancel button */
  addCloseButton() {
    const label = "cancel";
    const id = this.labelToID(label);
    const button = {
      id,
      label,
      callback: (btn: ButtonInteraction) => {
        btn.reply(`Cancelled`);
      },
    }

    this.buttons.push(button);
    GLOBAL_BUTTONS.push(button);

    return this;
  }

  /** stop collecting button click */
  close() {
    this.collector?.emit("end");
  }

  /** start collecting button click */
  async run() {
    const buttons = this.buttons.map((x) => {

      const btn = new MessageButton()
        .setCustomId(x.id)
        .setLabel(x.label)
        .setStyle("PRIMARY");

      if (x.id.toLowerCase().includes("cancel")) {
        btn.setStyle("DANGER");
      }

      return btn
    });

    const row = new MessageActionRow().addComponents(buttons);
    const menu = await this.i
      .editReply({ embeds: [this.embed], components: [row] }) as Message;

    const filter = (i: MessageComponentInteraction) => {

      const userID = i.user.id;

      if (this.filter && !this.filter(i.user)) return false;

      let isValidUser = this.userID === userID;

      if (this.users) {
        isValidUser = this.users.includes(userID);

      } else if (this.isMultiUser()) {
        isValidUser = true;

      }

      const clicked = this.clickedUsers.get(userID) || 0;

      if (isValidUser && clicked < this.max) {
        this.clickedUsers.set(userID, clicked + 1);
        return true;
      }

      return false;
    };

    let max = this.max;

    if (this.users) { 
      max = this.users.length * this.max; 

    } else if (this.isMultiUser()) { 
      max = this.maxUser * this.max;

    };

    const collector = menu.createMessageComponentCollector({
      max,
      filter,
      time: this.timeout,
    });

    this.collector = collector;

    return new Promise<void>((resolve, reject) => {

      const promises: Promise<void>[] = [];

      collector.on("collect", async (button: ButtonInteraction) => {
        let btn = this.buttons.find(x => x.id === button.customId);

        if (!btn) {
          btn = GLOBAL_BUTTONS.find(x => {
            const btnHandlerID = this.getButtonHandlerID(x.id);
            return btnHandlerID === this.id && x.id === button.customId
          });
        } 

        if (btn) {
          
          try {

            const promise = btn.callback(button);

            if (promise) promises.push(promise);

          } catch (err) {
            collector.emit("end");
            reject(err);
          }
        }

      })

      collector.on("end", () => {

        for (const button of this.buttons) {
          const index = GLOBAL_BUTTONS.findIndex(x => x.id === button.id);
          GLOBAL_BUTTONS.splice(index, 1);
        }

        menu.delete().catch(() => {});

        Promise.allSettled(promises)
          .then(() => resolve())
          .catch(err => reject(err));
      });
    });
  }
}
