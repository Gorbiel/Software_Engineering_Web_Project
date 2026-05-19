from django.test import TestCase

from apps.users.models import User
from apps.users.serializers import UserSerializer


class UserSerializerTests(TestCase):
    def test_serializer_creates_user_with_hashed_password(self):
        serializer = UserSerializer(
            data={
                "name": "Test User",
                "email": "user@example.com",
                "password": "password123",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertNotEqual(user.password, "password123")
        self.assertTrue(user.check_password("password123"))

    def test_password_is_write_only(self):
        user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password="password123",
        )

        data = UserSerializer(user).data

        self.assertNotIn("password", data)

    def test_serializer_updates_password_using_set_password(self):
        user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password="oldpassword",
        )

        serializer = UserSerializer(
            user,
            data={"password": "newpassword"},
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertTrue(user.check_password("newpassword"))

    def test_create_requires_password(self):
        serializer = UserSerializer(
            data={
                "name": "Test User",
                "email": "user@example.com",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_read_only_fields_cannot_be_overwritten(self):
        serializer = UserSerializer(
            data={
                "id": 999,
                "name": "Test User",
                "email": "user@example.com",
                "password": "password123",
                "active": True,
                "deactivation_date": "2026-01-01T00:00:00Z",
                "is_staff": True,
                "is_superuser": True,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertNotEqual(user.id, 999)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertIsNone(user.deactivation_date)