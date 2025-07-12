import ReconnectingWebSocket from "reconnecting-websocket";

export class Tadoku {
  private socket: ReconnectingWebSocket;
  private URL = "ws://localhost:6969";

  constructor() {
    this.socket = new ReconnectingWebSocket(this.URL);
  }

  send(time: number, processPath: string) {
    this.socket.send(JSON.stringify({ time, process_path: processPath }));
  }
}
