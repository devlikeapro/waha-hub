import {ref, watch, type Ref} from 'vue';
import {useToast} from 'primevue/usetoast';
import {useI18n} from 'vue-i18n';
import type {Label} from '../services/waha/dtos';
import type {ServerId} from '../services/hub/IHubServerAPI';
import {useServerStore} from '../stores/useServerStore';

/**
 * Labels of one chat: fetch, add, remove. Refetches when chatId changes.
 */
export const useChatLabels = (serverId: Ref<ServerId>, sessionName: Ref<string>, chatId: Ref<string>) => {
    const {t} = useI18n()
    const toast = useToast()
    const store = useServerStore()
    const labels = ref<Label[]>([])
    const allLabels = ref<Label[]>([])
    const saving = ref(false)
    // Labels are keyed by @lid, the GET and PUT below use the resolved id
    const resolvedChatId = ref<string | null>(null)

    async function resolveLid(id: string): Promise<string> {
        if (!id.endsWith('@c.us')) {
            return id
        }
        const result = await store.findLIDByPhoneNumber(serverId.value, sessionName.value, id)
        return result?.lid || id
    }

    async function refresh() {
        labels.value = []
        if (!serverId.value || !chatId.value) {
            return
        }
        try {
            resolvedChatId.value = await resolveLid(chatId.value)
            labels.value = await store.getChatLabels(serverId.value, sessionName.value, resolvedChatId.value) || []
        } catch (e) {
            console.warn('Failed to fetch chat labels', chatId.value, e)
        }
    }

    watch(chatId, refresh, {immediate: true})

    async function loadAll() {
        try {
            allLabels.value = await store.getLabels(serverId.value, sessionName.value) || []
        } catch (e) {
            console.warn('Failed to fetch labels', e)
        }
    }

    // PUT replaces the whole set, so add/remove send the current list +/- one label
    async function setLabels(next: Label[]) {
        saving.value = true
        labels.value = next
        try {
            await store.setChatLabels(serverId.value, sessionName.value, resolvedChatId.value!, next.map((l) => l.id))
        } catch (e: any) {
            toast.add({
                severity: 'error',
                summary: t('chat.labels.updateFailedTitle'),
                detail: e?.message || String(e),
                life: 5000,
            })
        } finally {
            saving.value = false
            await refresh()
        }
    }

    function has(label: Label): boolean {
        return labels.value.some((l) => l.id === label.id)
    }

    function remove(label: Label) {
        if (saving.value) return
        setLabels(labels.value.filter((l) => l.id !== label.id))
    }

    function add(label: Label) {
        if (saving.value) return
        setLabels([...labels.value, label])
    }

    return {labels, allLabels, saving, refresh, loadAll, has, add, remove}
}
