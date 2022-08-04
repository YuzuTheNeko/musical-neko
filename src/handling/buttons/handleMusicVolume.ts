import { ActionRowBuilder, ButtonInteraction, ComponentType, TextInputStyle, UnsafeModalBuilder, UnsafeTextInputBuilder } from "discord.js";
import { TRACK_LAST, TRACK_VOLUME, TRACK_VOLUME_MODAL, UNNEEDED_CUSTOM_ID } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_VOLUME) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return;

    if (!voice.manageableBy(i.member, undefined, i)) return;
    
    const modal = new UnsafeModalBuilder({
        title: `Volume Form`,
        custom_id: TRACK_VOLUME_MODAL
    })
    .addComponents(
        new ActionRowBuilder<UnsafeTextInputBuilder>().addComponents(
            new UnsafeTextInputBuilder({
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