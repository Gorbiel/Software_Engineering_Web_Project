from django.test import TestCase
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from apps.authentication.serializers import LoginSerializer, LogoutSerializer
from apps.users.models import User


class LoginSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password="password123",
        )

    def test_valid_credentials_are_accepted(self):
        serializer = LoginSerializer(
            data={"email": "user@example.com", "password": "password123"}
        )

        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["user"], self.user)

    def test_wrong_password_is_rejected(self):
        serializer = LoginSerializer(
            data={"email": "user@example.com", "password": "wrong"}
        )

        self.assertFalse(serializer.is_valid())

    def test_inactive_user_is_rejected(self):
        self.user.active = False
        self.user.save(update_fields=["active"])

        serializer = LoginSerializer(
            data={"email": "user@example.com", "password": "password123"}
        )

        self.assertFalse(serializer.is_valid())


class LogoutSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password="password123",
        )

    def test_valid_refresh_token_is_accepted(self):
        refresh = RefreshToken.for_user(self.user)

        serializer = LogoutSerializer(data={"refresh": str(refresh)})

        self.assertTrue(serializer.is_valid())

    def test_invalid_refresh_token_is_rejected_on_save(self):
        serializer = LogoutSerializer(data={"refresh": "invalid-token"})
        self.assertTrue(serializer.is_valid())

        with self.assertRaises(Exception):
            serializer.save()