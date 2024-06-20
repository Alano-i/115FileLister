from server.databases import *


class AudioSubcribe(BaseDBModel):

    __tablename__ = "audio_subscribe"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, comment="用户id")
    audio_id = Column(Integer, nullable=False, comment="有声书id")
    cn_name = Column(String(255), nullable=False, comment="有声书中文名")
    description = Column(String(255), nullable=False, comment="有声书描述")
    author = Column(String(255), nullable=False, comment="有声书作者")
    episode = Column(Integer, nullable=False, comment="有声书集数")
    status = Column(Integer, nullable=False, comment="订阅状态")

    @staticmethod
    def insert_subscribe(user_id: int, audio_id: int, cn_name: str, description: str, author: str, episode: int, status: int):
        """
        插入订阅信息
        :param user_id:
        :param audio_id:
        :param cn_name:
        :param description:
        :param author:
        :param episode:
        :param status:
        :return:
        """
        subscribe = AudioSubcribe(
            user_id=user_id,
            audio_id=audio_id,
            cn_name=cn_name,
            description=description,
            author=author,
            episode=episode,
            status=status
        )
        subscribe.save()

    @staticmethod
    def update_subscribe(user_id: int, audio_id: int, status: int):
        """
        更新订阅信息
        :param user_id:
        :param audio_id:
        :param status:
        :return:
        """
        subscribe = AudioSubcribe.query().filter_by(user_id=user_id, audio_id=audio_id).first()
        subscribe.status = status
        subscribe.update()

    @staticmethod
    def update_audio_info(audio_id: int, **kwargs):
        """
        更新有声书信息
        :param audio_id:
        :param kwargs:
        :return:
        """
        subscribe = AudioSubcribe.query().filter_by(audio_id=audio_id).first()
        if subscribe:
            for k, v in kwargs.items():
                setattr(subscribe, k, v)
            subscribe.update()

    @staticmethod
    def select_subscribe_by_user_id(user_id: int):
        """
        通过用户id查询订阅信息
        :param user_id:
        :return:
        """
        subscribe = AudioSubcribe.query().filter_by(user_id=user_id).all()
        return [sub.to_dict() for sub in subscribe] if subscribe else None

    @staticmethod
    def select_subscribe_by_audio_id(audio_id: int):
        """
        通过有声书id查询订阅信息
        :param audio_id:
        :return:
        """
        subscribe = AudioSubcribe.query().filter_by(audio_id=audio_id).all()
        return [sub.to_dict() for sub in subscribe] if subscribe else None

    @staticmethod
    def delete_subscribe(user_id: int, audio_id: int):
        """
        删除订阅信息
        :param user_id:
        :param audio_id:
        :return:
        """
        subscribe = AudioSubcribe.query().filter_by(user_id=user_id, audio_id=audio_id).first()
        subscribe.delete()