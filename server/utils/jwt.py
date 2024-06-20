
import os
import string
import secrets
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta, timezone
from jose import ExpiredSignatureError, jwt, JWTError


# 生成 JWT 密钥
def generate_jwt_secret_key(length=32):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))


SECRET_KEY = os.environ.get('JWT_SECRET_KEY', generate_jwt_secret_key())
os.environ["JWT_SECRET_KEY"] = SECRET_KEY
ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get(
    'ACCESS_TOKEN_EXPIRE_MINUTES', 300000000))


# 用于生成 access_token
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


# 用于从 Cookie 中获取并验证 access_token
async def auth_required(request: Request):
    token = request.cookies.get(
        "access_token", "") or request.query_params.get("access_token", "")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="请登录后重试！",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
        return {"username": username}
    except ExpiredSignatureError:
        raise credentials_exception
    except JWTError:
        raise credentials_exception
