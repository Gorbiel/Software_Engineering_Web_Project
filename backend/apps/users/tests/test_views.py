from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import Admin, User


class UserViewTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            name="Admin User",
            password="password123",
        )
        Admin.objects.create(user=self.admin_user)

        self.normal_user = User.objects.create_user(
            email="normal@example.com",
            name="Normal User",
            password="password123",
        )

    def authenticate_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_admin_can_list_users(self):
        self.authenticate_as(self.admin_user)

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_create_user(self):
        self.authenticate_as(self.admin_user)

        response = self.client.post(
            "/api/users/",
            {
                "name": "Created User",
                "email": "created@example.com",
                "password": "password123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="created@example.com").exists())

    def test_non_admin_cannot_create_user(self):
        self.authenticate_as(self.normal_user)

        response = self.client.post(
            "/api/users/",
            {
                "name": "Created User",
                "email": "created@example.com",
                "password": "password123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_create_user(self):
        response = self.client.post(
            "/api/users/",
            {
                "name": "Created User",
                "email": "created@example.com",
                "password": "password123",
            },
            format="json",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_admin_can_patch_user(self):
        self.authenticate_as(self.admin_user)

        response = self.client.patch(
            f"/api/users/{self.normal_user.id}/",
            {"name": "Updated User"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.normal_user.refresh_from_db()
        self.assertEqual(self.normal_user.name, "Updated User")

    def test_admin_can_soft_delete_user_with_delete(self):
        self.authenticate_as(self.admin_user)

        response = self.client.delete(f"/api/users/{self.normal_user.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.normal_user.refresh_from_db()
        self.assertFalse(self.normal_user.active)
        self.assertIsNotNone(self.normal_user.deactivation_date)

    def test_delete_does_not_remove_user_from_database(self):
        self.authenticate_as(self.admin_user)

        self.client.delete(f"/api/users/{self.normal_user.id}/")

        self.assertTrue(User.objects.filter(id=self.normal_user.id).exists())

    def test_admin_can_deactivate_user(self):
        self.authenticate_as(self.admin_user)

        response = self.client.patch(f"/api/users/{self.normal_user.id}/deactivate/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.normal_user.refresh_from_db()
        self.assertFalse(self.normal_user.active)
        self.assertIsNotNone(self.normal_user.deactivation_date)

    def test_admin_can_activate_user(self):
        self.normal_user.active = False
        self.normal_user.save(update_fields=["active"])

        self.authenticate_as(self.admin_user)

        response = self.client.patch(f"/api/users/{self.normal_user.id}/activate/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.normal_user.refresh_from_db()
        self.assertTrue(self.normal_user.active)
        self.assertIsNone(self.normal_user.deactivation_date)
