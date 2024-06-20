"""
与数据库有关的操作类
"""
import datetime
import os

from contextlib import contextmanager
from sqlalchemy import create_engine, Column, DateTime, String, Integer, Text, select, Boolean
from sqlalchemy.orm import declarative_base, Session
from sqlalchemy.exc import SQLAlchemyError

from server.utils.parse_field_value import parse_field_value

# WORKDIR环境变量文件夹内的db目录，为数据库文件存放目录
db_path = os.path.join(os.environ.get(
    'WORKDIR', os.path.dirname(os.path.abspath(__file__))), 'db')
if not os.path.exists(db_path):
    os.makedirs(db_path)
engine = create_engine(
    f'sqlite:////{db_path}/main.db?check_same_thread=False&timeout=60',
    pool_size=10,
    max_overflow=20,
    pool_timeout=60
)
Base = declarative_base()


def create_all():
    """
    自动初始化数据库引擎和ORM框架
    会自动生成模型定义的结构为数据表
    :return:
    """
    Base.metadata.create_all(engine)


@contextmanager
def session_scope():
    """
    数据库会话上下文管理器
    用于自动提交或回滚
    :return:
    """
    session = Session(bind=engine)
    try:
        yield session
        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        raise
    finally:
        session.close()


class BaseDBModel(Base):
    """
    数据表基类，每张表的模型类继承此类
    """
    __abstract__ = True
    __table_args__ = {'extend_existing': True}
    created_at = Column(DateTime, nullable=False,
                        default=datetime.datetime.now)
    updated_at = Column(DateTime, nullable=False,
                        default=datetime.datetime.now, onupdate=datetime.datetime.now)

    def get_columns(self):
        """
        返回所有字段对象
        :return:
        """
        return self.__table__.columns

    @classmethod
    def query(cls):
        """
        查询
        :param cls:
        :return:
        """
        with session_scope() as session:
            return session.query(cls)

    def get_fields(self):
        """
        返回所有字段
        :return:
        """
        return self.__dict__

    def save(self):
        """
        新增
        :return:
        """
        with session_scope() as session:
            session.add(self)

    def update(self):
        """
        新增
        :return:
        """
        with session_scope() as session:
            self.updated_at = datetime.datetime.now()
            session.merge(self)

    @staticmethod
    def save_all(model_list):
        """
        批量新增
        :param model_list:
        :return:
        """
        with session_scope() as session:
            session.add_all(model_list)

    def delete(self):
        """
        删除
        :return:
        """
        with session_scope() as session:
            session.delete(self)

    def to_dict(self, hidden_fields=None):
        """
        Json序列化
        :param hidden_fields: 覆盖类属性 hidden_fields
        :return:
        """
        model_json = {}
        # if not hidden_fields:
        #     hidden_fields = self.__hidden_fields__
        # if not hidden_fields:
        #     hidden_fields = []
        for column in self.__dict__:
            # if column in hidden_fields:
            #     continue
            if hasattr(self, column):
                model_json[column] = parse_field_value(getattr(self, column))
        if '_sa_instance_state' in model_json:
            del model_json['_sa_instance_state']
        if 'id' in model_json:
            del model_json['id']
        return model_json
