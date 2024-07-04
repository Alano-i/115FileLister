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
    setting: true,
    fullscreen: true,
    fullscreenWeb: true,
    plugins: [
      artplayerPluginHlsQuality({
        // Show quality in control
        control: false,

        // Show quality in setting
        setting: true,

        // Get the resolution text from level
        getResolution: (level) => {
          console.info(level);
          if (level.height <= 0) return "默认";
          return level.height + "P";
        },

        // I18n
        title: "质量",
        auto: "自动",
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
          art.notice.show = "不支持播放格式: m3u8";
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
    <div className="md:px-20 h-full flex justify-center items-center rounded-[50px]">
      <div className="w-full aspect-video rounded-[50px]"
        // 播放器的尺寸依赖于容器 container 的尺寸，所以你的容器 container 必须是有尺寸的
        // style={{
        //   width: "100%",
        //   height: "720px",
        //   margin: "0",
        // }}
        ref={artRef}
      />
    </div>
  );
};

export default Player;
