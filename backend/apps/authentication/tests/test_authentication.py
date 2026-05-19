from django.test import TestCase
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from apps.authentication.authentication import CustomJWTAuthentication
from apps.users.models import User


class CustomJWTAuthenticationTests(TestCase):
    def setUp(self):
        self.auth = CustomJWTAuthentication()
        self.user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password="password123",
        )

    def test_get_user_returns_user_for_valid_token(self):
        token = RefreshToken.for_user(self.user).access_token

        user = self.auth.get_user(token)

        self.assertEqual(user, self.user)

    def test_get_user_rejects_token_without_user_id(self):
        token = AccessToken()
        if "user_id" in token:
            del token["user_id"]

        with self.assertRaises(AuthenticationFailed):
            self.auth.get_user(token)

    def test_get_user_rejects_nonexistent_user(self):
        token = AccessToken()
        token["user_id"] = 999999

        with self.assertRaises(AuthenticationFailed):
            self.auth.get_user(token)

    def test_get_user_rejects_inactive_user(self):
        self.user.active = False
        self.user.save(update_fields=["active"])

        token = RefreshToken.for_user(self.user).access_token

        with self.assertRaises(AuthenticationFailed):
            self.auth.get_user(token)
