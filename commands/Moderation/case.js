const { Command } = require('klasa');

module.exports = class extends Command {

  constructor(...args) {
    super(...args, {
      name: 'case',
      permLevel: 4,
      runIn: ['text'],
      description: language => language.get('COMMAND_CASE_DESCRIPTION'),
      usage: '<case:integer>'
    });
  }

  async run(msg, [caseNum]) {
    const logs = await this.provider.get('modlogs', msg.guild.id);
    const info = logs.infractions.find(infractions => infractions.case === caseNum);

    const user = this.client.users.get(info.user);
    const moderator = this.client.users.get(info.moderator);

    return msg.send([
      `User      : ${user.tag} (${user.id})`,
      `Moderator : ${moderator.tag} (${moderator.id})`,
      `Reason    : ${info.reason || `${msg.language.get('COMMAND_CASE_REASON')} '${msg.guild.settings.prefix}reason ${caseNum}' ${msg.language.get('COMMAND_CASE_CLAIM')}`}`
    ], { code: 'http' });
  }

  get provider() {
    return this.client.providers.default;
  }
};
