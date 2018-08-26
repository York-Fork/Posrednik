const { MessageEmbed } = require('discord.js');
module.exports = class ModLog {

    constructor(guild) {
        this.guild = guild;
        this.client = guild.client;

        this.type = null;
        this.user = null;
        this.moderator = null;
        this.reason = null;
        this.timed = null;

        this.case = null;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    setUser(user) {
        this.user = {
            id: user.id,
            tag: user.tag
        };
        return this;
    }

    // Here we get all the info about the executing Moderator

    setModerator(user) {
        this.moderator = {
            id: user.id,
            tag: user.tag,
            avatar: user.displayAvatarURL()
        };
        return this;
    }

    setReason(reason = null) {
        if (reason instanceof Array) reason = reason.join(' ');
        this.reason = reason;
        return this;
    }

    setTimed(value) {
        this.timed = value;
        return this;
    }

    // Checks if the modlog channel still exsists if not it throws an error to the console

    async send() {
        const channel = this.guild.channels.get(this.guild.settings.modlog);
        if (!channel) throw 'The modlog channel does not exist, did it get deleted?';
        await this.getCase();
        return channel.send({ embed: this.embed });
    }

    // Here we build the modlog embed

    get embed() {
        const embed = new MessageEmbed()
            .setAuthor(this.moderator.tag, this.moderator.avatar)
            .setColor(ModLog.colour(this.type))
            .setDescription([
                `**Type**: ${this.type[0].toUpperCase() + this.type.slice(1)}`,
                `**User**: ${this.user.tag} (${this.user.id})`,
                `**Reason**: ${this.reason || `Use \`${this.guild.settings.prefix}reason ${this.case}\` to claim this log.`}`,
                `**Timed Infraction**: ${this.timed}`
            ])
            .setFooter(`Case ${this.case}`)
            .setTimestamp();
        return embed;
    }

    // Here we get the case number and create a modlog provider entry

    async getCase() {
        const modlogs = await this.provider.get('modlogs', this.guild.id);
        if (!modlogs) {
            this.case = 0;
            return this.provider.create('modlogs', this.guild.id, { infractions: [this.pack] }).then(() => 0);
        }
        this.case = modlogs.infractions.length
        modlogs.infractions.push(this.pack);
        await this.provider.update('modlogs', this.guild.id, modlogs);
    }

    // Here we pack all the info together

    get pack() {
        return {
            type: this.type,
            user: this.user.id,
            moderator: this.moderator.id,
            reason: this.reason,
            case: this.case,
            timed: this.timed
        };
    }

    get provider() {
        return this.client.providers.default;
    }

    // And here we just define the color for a certain type of offence or action

    static colour(type) {
        switch (type) {
            case 'ban': return 16724253;
            case 'unban': return 1822618;
            case 'warn': return 16564545;
            case 'kick': return 16573465;
            case 'softban': return 15014476;
            default: return 16777215;
        }
    }

};
