"""
JWT and Token Configuration for GlazedIn.
Comprehensive settings for django-rest-framework-simplejwt.
"""

from datetime import timedelta

# Token Expiration Times
# These values balance security with user experience
ACCESS_TOKEN_LIFETIME = timedelta(hours=1)  # 1 hour
REFRESH_TOKEN_LIFETIME = timedelta(days=7)  # 7 days
ROTATE_REFRESH_TOKENS = True  # Issue new refresh token on each refresh request
BLACKLIST_AFTER_ROTATION = True  # Blacklist old refresh tokens after rotation

# Algorithm and Signing
ALGORITHM = "HS256"  # HMAC with SHA-256
SIGNING_KEY = None  # Will use Django SECRET_KEY if not set
VERIFYING_KEY = None  # For asymmetric algorithms (RS256, etc.)

# Token Type
TOKEN_TYPE_CLAIM = "token_type"  # JWT claim for token type (access/refresh)
JTI_CLAIM = "jti"  # JWT ID claim for token uniqueness

# Authentication
AUTH_HEADER_TYPES = ("Bearer",)
AUTH_HEADER_NAME = "HTTP_AUTHORIZATION"
USER_ID_FIELD = "id"
USER_ID_CLAIM = "user_id"
USER_AUTHENTICATION_RULE = "rest_framework_simplejwt.authentication.default_user_authentication_rule"

# Token Blacklist
BLACKLIST_MODELS = ("rest_framework_simplejwt.token_blacklist.models.OutstandingToken",)
CHECK_REVOKE_TOKEN = True  # Check if token is blacklisted

# Update On Login
UPDATE_LAST_LOGIN = False  # Don't update user.last_login on token generation (optional)

# SimpleJWT Configuration Dictionary for Django REST Framework
# This is what goes into settings.py REST_FRAMEWORK or SIMPLE_JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": ACCESS_TOKEN_LIFETIME,
    "REFRESH_TOKEN_LIFETIME": REFRESH_TOKEN_LIFETIME,
    "ROTATE_REFRESH_TOKENS": ROTATE_REFRESH_TOKENS,
    "BLACKLIST_AFTER_ROTATION": BLACKLIST_AFTER_ROTATION,
    "ALGORITHM": ALGORITHM,
    "SIGNING_KEY": SIGNING_KEY,
    "VERIFYING_KEY": VERIFYING_KEY,
    "AUTH_HEADER_TYPES": AUTH_HEADER_TYPES,
    "AUTH_HEADER_NAME": AUTH_HEADER_NAME,
    "USER_ID_FIELD": USER_ID_FIELD,
    "USER_ID_CLAIM": USER_ID_CLAIM,
    "USER_AUTHENTICATION_RULE": USER_AUTHENTICATION_RULE,
    "JTI_CLAIM": JTI_CLAIM,
    "TOKEN_TYPE_CLAIM": TOKEN_TYPE_CLAIM,
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "CHECK_REVOKE_TOKEN": CHECK_REVOKE_TOKEN,
    "UPDATE_LAST_LOGIN": UPDATE_LAST_LOGIN,
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
    "SLIDING_TOKEN_LIFETIME": timedelta(hours=5),
}

