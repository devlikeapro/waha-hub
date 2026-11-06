import { useServerStore } from "../stores/useServerStore";

const PATHS = {
  info: "proxy/info",
  connect: "proxy/probe/connect",
  http: "proxy/probe/http",
  exitIp: "proxy/probe/exit-ip",
  websocket: "proxy/probe/websocket",
};

/**
 * The proxy probe calls for one modal. The session endpoints check the proxy the session has; a proxy typed into
 * the form (or no session at all) goes to the /api/proxy ones. props is the reactive props object
 * (server, sessionName, proxy).
 */
export function useProxyApi(props) {
  const store = useServerStore();

  function sessionName() {
    if (props.proxy?.server) {
      return null;
    }
    return props.sessionName;
  }

  function path(probe) {
    const name = sessionName();
    if (name) {
      return `/api/sessions/${name}/${PATHS[probe]}`;
    }
    return `/api/${PATHS[probe]}`;
  }

  function call(probe, body) {
    const server = props.server;
    const name = sessionName();
    switch (probe) {
      case "info":
        return store.getProxyInfo(server, name, body);
      case "connect":
        return store.probeProxyConnect(server, name, body);
      case "http":
        return store.probeProxyHttp(server, name, body);
      case "exitIp":
        return store.probeProxyExitIp(server, name, body);
      case "websocket":
        return store.probeProxyWebSocket(server, name, body);
    }
  }

  /**
   * The request as shown in the details block
   */
  function describe(probe, body) {
    return { method: "POST", url: path(probe), body: body };
  }

  return { call, describe };
}
