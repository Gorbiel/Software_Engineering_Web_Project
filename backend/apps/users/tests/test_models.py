from django.db import IntegrityError
from django.test import TestCase

from apps.users.models import Admin, User


class UserModelTests(TestCase):
    def test_create_user_hashes_password(self):
        user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password="password123",
        )

        self.assertNotEqual(user.password, "password123")
        self.assertTrue(user.check_password("password123"))

    def test_create_superuser_sets_flags(self):
        user = User.objects.create_superuser(
            email="admin@example.com",
            name="Admin User",
            password="password123",
        )

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.active)

    def test_active_queryset_returns_active_users(self):
        active = User.objects.create_user(
            email="active@example.com",
            name="Active User",
            password="password123",
        )
        inactive = User.objects.create_user(
            email="inactive@example.com",
            name="Inactive User",
            password="password123",
        )
        inactive.active = False
        inactive.save(update_fields=["active"])

        self.assertIn(active, User.users.active())
        self.assertNotIn(inactive, User.users.active())

    def test_inactive_queryset_returns_inactive_users(self):
        active = User.objects.create_user(
            email="active@example.com",
            name="Active User",
            password="password123",
        )
        inactive = User.objects.create_user(
            email="inactive@example.com",
            name="Inactive User",
            password="password123",
        )
        inactive.active = False
        inactive.save(update_fields=["active"])

        self.assertIn(inactive, User.users.inactive())
        self.assertNotIn(active, User.users.inactive())

    def test_admin_is_one_to_one_with_user(self):
        user = User.objects.create_user(
            email="admin@example.com",
            name="Admin User",
            password="password123",
        )

        Admin.objects.create(user=user)

        with self.assertRaises(IntegrityError):
            Admin.objects.create(user=user)