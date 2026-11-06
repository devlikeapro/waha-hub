<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// The proxy inputs shared by the session form and the Proxy Checks modal: scheme, server, username, password
const proxy = defineModel("proxy", { type: Object, required: true });
defineProps({
  // Show the "server is required" error
  submitted: { type: Boolean, default: false },
  // While the checks run
  disabled: { type: Boolean, default: false },
});

const schemeOptions = ["http", "https", "socks5"];

// A full URL in the server field can be split into the four inputs, and the four joined back into one URL
const canSplit = computed(() =>
  /^(http|https|socks5):\/\//i.test(proxy.value.server ?? "")
);
const canJoin = computed(() => {
  const server = proxy.value.server ?? "";
  return !!server && !server.includes("://") && !!proxy.value.scheme;
});

/**
 * A bare "%" in the credentials is not a valid escape - keep the text as typed then
 */
function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function splitUrl() {
  let url;
  try {
    url = new URL(proxy.value.server);
  } catch {
    return;
  }
  proxy.value.scheme = url.protocol.replace(":", "").toLowerCase();
  proxy.value.server = url.host;
  // Credentials typed into the fields stay when the URL has none
  if (url.username) {
    proxy.value.username = decode(url.username);
  }
  if (url.password) {
    proxy.value.password = decode(url.password);
  }
}

/**
 * Credentials are percent-encoded, so "p@ss:word" survives the trip back through "Split URL"
 */
function joinUrl() {
  let auth = "";
  if (proxy.value.username) {
    auth = encodeURIComponent(proxy.value.username);
    if (proxy.value.password) {
      auth += ":" + encodeURIComponent(proxy.value.password);
    }
    auth += "@";
  }
  proxy.value.server = `${proxy.value.scheme}://${auth}${proxy.value.server}`;
  proxy.value.scheme = undefined;
  proxy.value.username = undefined;
  proxy.value.password = undefined;
}
</script>

<template>
  <div class="flex gap-3">
    <div class="field w-4">
      <label for="proxy-scheme">{{ t("sessions.proxyScheme") }}</label>
      <Dropdown
        id="proxy-scheme"
        v-model="proxy.scheme"
        :options="schemeOptions"
        showClear
        class="w-full"
        :disabled="disabled"
      />
    </div>
    <div class="field w-full">
      <!-- mb-2: the wrapper takes the label out of the ".field > label" rule that spaces the other fields -->
      <div class="flex justify-content-between align-items-center mb-2">
        <label for="proxy-server">{{ t("sessions.server") }}</label>
        <a
          v-if="canSplit && !disabled"
          href="#"
          class="text-sm"
          @click.prevent="splitUrl"
        >
          {{ t("sessions.proxySplitUrl") }}
        </a>
        <a
          v-else-if="canJoin && !disabled"
          href="#"
          class="text-sm"
          @click.prevent="joinUrl"
        >
          {{ t("sessions.proxyJoinUrl") }}
        </a>
      </div>
      <InputText
        id="proxy-server"
        v-model.trim="proxy.server"
        required="true"
        :invalid="submitted && !proxy.server"
        :placeholder="t('sessions.hostPort')"
        class="w-full"
        :disabled="disabled"
      />
      <small class="p-invalid" v-if="submitted && !proxy.server">
        {{ t("sessions.serverRequired") }}
      </small>
    </div>
  </div>
  <div class="flex gap-3">
    <div class="field w-full">
      <label for="proxy-username">{{ t("sessions.usernameOptional") }}</label>
      <InputText
        id="proxy-username"
        v-model.trim="proxy.username"
        :disabled="disabled"
      />
    </div>
    <div class="field w-full">
      <label for="proxy-password">{{ t("sessions.passwordOptional") }}</label>
      <Password
        id="proxy-password"
        v-model.trim="proxy.password"
        :feedback="false"
        toggleMask
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
