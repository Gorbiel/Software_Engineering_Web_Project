from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import User


class AuthViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password="password123",
        )

    def login(self):
        return self.client.post(
            "/api/auth/login/",
            {"email": "user@example.com", "password": "password123"},
            format="json",
        )

    def test_login_returns_access_refresh_and_user(self):
        response = self.login()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "user@example.com")

    def test_refresh_returns_new_access_token(self):
        login_response = self.login()
        refresh = login_response.data["refresh"]

        response = self.client.post(
            "/api/auth/refresh/",
            {"refresh": refresh},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_me_returns_current_user(self):
        login_response = self.login()
        access = login_response.data["access"]

        response = self.client.get(
            "/api/auth/me/",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "user@example.com")

    def test_anonymous_me_is_rejected(self):
        response = self.client.get("/api/auth/me/")

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_logout_blacklists_refresh_token(self):
        login_response = self.login()
        access = login_response.data["access"]
        refresh = login_response.data["refresh"]

        logout_response = self.client.post(
            "/api/auth/logout/",
            {"refresh": refresh},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )

        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post(
            "/api/auth/refresh/",
            {"refresh": refresh},
            format="json",
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)