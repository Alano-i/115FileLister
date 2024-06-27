// url = attr["url"]
// <!-- IINA播放器 -->
// href="iina://weblink?url={{ url }}"

import { Modal } from "antd";

// <!-- PotPlayer播放器 -->
// href="potplayer://{{ url }}"

// <!-- VLC播放器 -->
// href="vlc://{{ url }}"

// <!-- Fileball播放器 -->
// href="filebox://play?url={{ url }}"

// <!-- MX Player播放器 -->
// href="intent:{{ attr["short_url"] }}#Intent;package=com.mxtech.videoplayer.pro;S.title={{ name }};end"

// <!-- infuse播放器 -->
// href="infuse://x-callback-url/play?url={{ url }}"

// <!-- nPlayer播放器 -->
// href="nplayer-{{ url }}"

// <!-- OmniPlayer播放器 -->
// href="omniplayer://weblink?url={{ url }}"

// <!-- Fig Player播放器 -->
// href="figplayer://weblink?url={{ url }}"

// <!-- MPV播放器 -->
// href="mpv://{{ url }}"

const getPlayer = (url: string) => {
  return [
    {
      name: "IINA",
      url: `iina://weblink?url=${url}`,
      icon: "/img/iina.svg",
    },
    {
      name: "Pot",
      url: `potplayer://${url}`,
      icon: "/img/potplayer.svg",
    },
    {
      name: "VLC",
      url: `vlc://${url}`,
      icon: "/img/vlc.svg",
    },
    {
      name: "Fileball",
      url: `filebox://play?url=${url}`,
      icon: "/img/fileball.svg",
    },
    {
      name: "MX",
      url: `intent:${url}#Intent;package=com.mxtech.videoplayer.pro;S.title=;end`,
      icon: "/img/mxplayer.svg",
    },
    {
      name: "Infuse",
      url: `infuse://x-callback-url/play?url=${url}`,
      icon: "/img/infuse.svg",
    },
    {
      name: "nPlayer",
      url: `nplayer-${url}`,
      icon: "/img/nplayer.svg",
    },
    {
      name: "Omni",
      url: `omniplayer://weblink?url=${url}`,
      icon: "/img/omni.png",
    },
    {
      name: "Fig",
      url: `figplayer://weblink?url=${url}`,
      icon: "/img/fig.png",
    },
    {
      name: "MPV",
      url: `mpv://${url}`,
      icon: "/img/mpv.png",
    },
  ];
};

// 播放器跳转列表
const PlayerList = ({
  url,
  isModalOpen,
  setIsModalOpen,
}: {
  url: string;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}) => {
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      centered
      width="auto"
      footer={null}
    >
      {
        <div>
          <div className="text-center mb-8 text-[18px] text-[#ffffffcc] font-semibold">
            选择播放器
          </div>
          <div className="grid px-6 pb-6 grid-cols-5 gap-x-4 gap-y-4">
            {getPlayer(window.location.host + url).map((player) => (
              <div
                key={player.name}
                className="flex flex-col items-center justify-center space-y-[8px] w-[100px] h-[104px] rounded-[10px] hover:bg-[#ffffff0f] cursor-pointer transition-all duration-300 ease-in-out"
                onClick={() => window.open(player.url, "_blank")}
              >
                <img
                  src={player.icon}
                  className="w-[50px] h-[50px]"
                  alt="player"
                />
                <span className="text-[#FFFFFFCC]">{player.name}</span>
              </div>
            ))}
          </div>
        </div>
      }
    </Modal>
  );
};

export default PlayerList;
