from rest_framework import status
from rest_framework.test import APITestCase

from apps.glazes.models import Glaze
from apps.users.models import Admin, User


class GlazeModerationTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com",
            name="Owner",
            password="password123",
        )
        self.receiver = User.objects.create_user(
            email="receiver@example.com",
            name="Receiver",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            name="Other",
            password="password123",
        )
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            name="Admin",
            password="password123",
        )
        Admin.objects.create(user=self.admin_user)

        self.glaze = Glaze.objects.create(
            posting_user=self.owner,
            receiving_user=self.receiver,
            title="Kudos",
            body="Great work",
        )

    def login(self, email, password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_admin_can_delete_foreign_glaze(self):
        token = self.login(email="admin@example.com")

        response = self.client.delete(
            f"/api/glazes/{self.glaze.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Glaze.objects.filter(id=self.glaze.id).exists())

    def test_admin_cannot_patch_foreign_glaze(self):
        token = self.login(email="admin@example.com")

        response = self.client.patch(
            f"/api/glazes/{self.glaze.id}/",
            {"title": "Updated by admin"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_owner_non_admin_cannot_delete_foreign_glaze(self):
        token = self.login(email="other@example.com")

        response = self.client.delete(
            f"/api/glazes/{self.glaze.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
