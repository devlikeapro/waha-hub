import { computed, ref } from "vue";

export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

export function bold(value) {
  return `<b>${escapeHtml(value)}</b>`;
}

export function seconds(ms) {
  return Math.floor((ms ?? 0) / 1000);
}

/**
 * The IP in bold, linking to its country, ASN and hosting flag on ipinfo.io in a new tab
 */
export function ipLink(ip) {
  const href = `https://ipinfo.io/${encodeURIComponent(ip)}`;
  return (
    `<a href="${href}" target="_blank" rel="noopener">${bold(ip)} ` +
    `<i class="pi pi-external-link"></i></a>`
  );
}

/**
 * A failed check in one line: a probe failure carries { code, message }, a NestJS error body a plain message
 */
export function failDetail(check) {
  const error = check.data.value?.error;
  if (error?.code) return `${bold(error.code)}: ${escapeHtml(error.message)}`;
  return escapeHtml(check.error.value || check.data.value?.message || "");
}

/**
 * The state of one proxy check: pending -> running -> ok | fail, with what was sent and what came back.
 * buildBody() returns the request body as of now (the inputs may change between runs).
 * execute(body, cancelled) runs the probe and returns { data, response }: data drives the status and the
 * sentence, response is what the Details show. One call by default; a multi-call check passes its own and
 * gives up as soon as cancelled() turns true.
 */
export function useProxyCheck(probe, api, buildBody, execute = null) {
  const run1 = async (body) => {
    const result = await api.call(probe, body);
    return { data: result, response: result };
  };
  const runProbe = execute ?? run1;
  const status = ref("pending");
  const data = ref(null);
  const error = ref(null);
  const httpStatus = ref(null);
  const sent = ref(null);
  // Before a run the details show what would be sent right now, so edited inputs show up at once
  const request = computed(() => {
    if (status.value === "pending") {
      return api.describe(probe, buildBody());
    }
    return sent.value;
  });
  const response = ref(null);
  const showDetails = ref(false);
  // A run that was cancelled or superseded must not write its late result back
  let token = 0;

  /**
   * Results only, the inputs the check owns stay as they are
   */
  function clear() {
    token += 1;
    status.value = "pending";
    data.value = null;
    error.value = null;
    httpStatus.value = null;
    sent.value = null;
    response.value = null;
    showDetails.value = false;
  }

  /**
   * Stop listening; the server finishes the probe on its own
   */
  function cancel() {
    token += 1;
    if (status.value === "running") {
      status.value = "pending";
    }
  }

  /**
   * Resolves to true when the check finished on its own (not cancelled)
   */
  async function run() {
    const mine = ++token;
    const body = buildBody();
    status.value = "running";
    data.value = null;
    error.value = null;
    httpStatus.value = null;
    sent.value = api.describe(probe, body);
    response.value = null;
    try {
      const outcome = await runProbe(body, () => mine !== token);
      if (mine !== token) return false;
      data.value = outcome.data;
      response.value = outcome.response;
      status.value = outcome.data?.ok === false ? "fail" : "ok";
    } catch (e) {
      if (mine !== token) return false;
      // An HTTP error (422 no proxy, 404, 403, 5xx) fails the check with the message from the API
      data.value = e?.response?.data ?? null;
      response.value = data.value;
      httpStatus.value = e?.response?.status ?? null;
      error.value = e?.response?.data?.message || e?.message || String(e);
      status.value = "fail";
    }
    return true;
  }

  return {
    status,
    data,
    error,
    httpStatus,
    request,
    response,
    showDetails,
    run,
    clear,
    cancel,
  };
}

/**
 * The sentence next to the status icon: pending and running read the same for every check, ok is per check
 */
export function detailFor(t, check, key, ok, runningParams) {
  switch (check.status.value) {
    case "pending":
      return t("sessions.proxyChecks.notRun");
    case "running":
      return t(`sessions.proxyChecks.${key}Running`, runningParams?.() ?? {});
    case "fail":
      return failDetail(check);
    case "ok":
      return check.data.value ? ok(check.data.value) : "";
  }
  return "";
}
