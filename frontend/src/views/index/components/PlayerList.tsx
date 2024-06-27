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
    },
    {
      name: "PotPlayer",
      url: `potplayer://${url}`,
    },
    {
      name: "VLC",
      url: `vlc://${url}`,
    },
    {
      name: "Fileball",
      url: `filebox://play?url=${url}`,
    },
    {
      name: "MX Player",
      url: `intent:${url}#Intent;package=com.mxtech.videoplayer.pro;S.title=;end`,
    },
    {
      name: "infuse",
      url: `infuse://x-callback-url/play?url=${url}`,
    },
    {
      name: "nPlayer",
      url: `nplayer-${url}`,
    },
    {
      name: "OmniPlayer",
      url: `omniplayer://weblink?url=${url}`,
    },
    {
      name: "Fig Player",
      url: `figplayer://weblink?url=${url}`,
    },
    {
      name: "MPV",
      url: `mpv://${url}`,
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
      title="播放器"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      centered
    >
      {getPlayer(window.location.host + url).map((player) => (
        <div className="flex justify-between" key={player.name}>
          {player.name}
          <a href={player.url} target="_blank" rel="noreferrer">
            跳转
          </a>
        </div>
      ))}
    </Modal>
  );
};

export default PlayerList;
