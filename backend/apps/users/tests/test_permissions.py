from types import SimpleNamespace

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from apps.users.models import Admin, User
from apps.users.permissions import IsGlazedInAdmin


class IsGlazedInAdminPermissionTests(TestCase):
    def setUp(self):
        self.permission = IsGlazedInAdmin()
        self.factory = APIRequestFactory()

    def test_admin_user_passes_permission(self):
        user = User.objects.create_user(
            email="admin@example.com",
            name="Admin User",
            password="password123",
        )
        Admin.objects.create(user=user)

        request = self.factory.get("/api/users/")
        request.user = user

        self.assertTrue(self.permission.has_permission(request, None))

    def test_non_admin_user_fails_permission(self):
        user = User.objects.create_user(
            email="user@example.com",
            name="Normal User",
            password="password123",
        )

        request = self.factory.get("/api/users/")
        request.user = user

        self.assertFalse(self.permission.has_permission(request, None))

    def test_anonymous_user_fails_permission(self):
        request = self.factory.get("/api/users/")
        request.user = SimpleNamespace(is_authenticated=False)

        self.assertFalse(self.permission.has_permission(request, None))
