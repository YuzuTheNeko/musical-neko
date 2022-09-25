import { ActionRowBuilder, ButtonInteraction, ComponentType, TextInputStyle, ModalBuilder, TextInputBuilder } from "discord.js";
import { TRACK_LAST, TRACK_VOLUME, TRACK_VOLUME_MODAL, UNNEEDED_CUSTOM_ID } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_VOLUME) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return;

    if (!(await voice.manageableBy(i.member, undefined, i))) return;
    
    const modal = new ModalBuilder()
    .setTitle(`Volume Form`)
    .setCustomId(TRACK_VOLUME_MODAL)
    .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder({
                custom_id: UNNEEDED_CUSTOM_ID(),
                label: `Volume`,
                style: TextInputStyle.Short,
                required: false,
                type: ComponentType.TextInput,
                placeholder: `Place new volume...`,
                value: '100',
                max_length: 3
            })
        )
    )

    i.showModal(modal)
    .catch(noop)
}