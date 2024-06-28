import { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import { useSearchParams } from "react-router-dom";
import Hls from "hls.js";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";

const Player = () => {
  let [searchParams, _] = useSearchParams();

  const pickcode = searchParams.get("pickcode");

  const artRef = useRef(null);

  const option = {
    url: `/api/m3u8?pickcode=${pickcode}`,
    // url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    type: "m3u8",
    // setting: true,
    plugins: [
      artplayerPluginHlsQuality({
        // Show quality in control
        control: true,

        // Show quality in setting
        // setting: true,

        // Get the resolution text from level
        getResolution: (level) => level.height + "P",

        // I18n
        title: "Quality",
        auto: "Auto",
      }),
    ],
    customType: {
      m3u8: function playM3u8(
        video: HTMLMediaElement,
        url: string,
        art: Artplayer
      ) {
        if (Hls.isSupported()) {
          if (art.hls) art.hls.destroy();
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          art.hls = hls;
          art.on("destroy", () => hls.destroy());
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          art.notice.show = "Unsupported playback format: m3u8";
        }
      },
    },
  };

  const getInstance = (art: Artplayer) => console.info(art);

  useEffect(() => {
    if (!artRef.current) {
      return;
    }

    const art = new Artplayer({
      ...option,
      container: artRef.current,
    });

    art.on("error", (error, reconnectTime) => {
      console.info(error, reconnectTime);
    });

    if (getInstance && typeof getInstance === "function") {
      getInstance(art);
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, []);

  if (!pickcode) {
    return <div>无效的 pickcode</div>;
  }

  return (
    <div>
      <div
        // 播放器的尺寸依赖于容器 container 的尺寸，所以你的容器 container 必须是有尺寸的
        style={{
          width: "600px",
          height: "400px",
          margin: "60px auto 0",
        }}
        ref={artRef}
      />
    </div>
  );
};

export default Player;
