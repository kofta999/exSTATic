console.log("Injected");

import * as browser from "webextension-polyfill";
import { VNStorage } from "./vn_storage";
import App from "./vn.svelte";
import { mount } from "svelte";
import { Tadoku } from "../tadoku";

const setup = async () => {
  const vn_storage = await VNStorage.build(true);
  const tadoku = new Tadoku();

  let port;
  const connectMessaging = () => {
    port = browser.runtime.connect({ name: "vn_lines" });
    port.onDisconnect.addListener(connectMessaging);

    let prevTime = vn_storage.instance_storage?.today_stats?.time_read;

    port.onMessage.addListener(async (data) => {
      await vn_storage.changeInstance(undefined, data["process_path"]);
      await vn_storage.addLine(data["line"], data["date"], data["time"]);

      const timeRead = vn_storage.instance_storage?.today_stats.time_read;
      if (timeRead) {
        const delta = timeRead - (prevTime || timeRead);
        console.log({ delta, timeRead, prevTime });
        tadoku.send(delta, data["original_process_path"]);
        prevTime = timeRead;
      }
    });
  };
  connectMessaging();

  mount(App, {
    target: document.documentElement,
    props: {
      vn_storage: vn_storage,
    },
  });
};
setup();
