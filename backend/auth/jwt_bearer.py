from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .jwt_handler import decode_access_token


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if not credentials or credentials.scheme != "Bearer":
            raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
        payload = decode_access_token(credentials.credentials)
        if payload is None:
            raise HTTPException(status_code=403, detail="Invalid or expired token.")
        request.state.user_id = payload["sub"]
        request.state.email = payload["email"]
        request.state.name = payload["name"]
        return credentials.credentials


jwt_bearer = JWTBearer()
