from rest_framework import status
from rest_framework.test import APITestCase

from apps.achievements.models import Achievement, AchievementConfirmation
from apps.users.models import User


class AchievementViewSetTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@example.com",
            name="User One",
            password="password123",
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com",
            name="User Two",
            password="password123",
        )

        self.achievement1 = Achievement.objects.create(
            user=self.user1,
            title="First Achievement",
            body="Description 1",
        )
        self.achievement2 = Achievement.objects.create(
            user=self.user2,
            title="Second Achievement",
            body="Description 2",
        )

    def login(self, email="user1@example.com", password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_list_achievements(self):
        token = self.login()

        response = self.client.get(
            "/api/achievements/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_achievement(self):
        token = self.login()

        response = self.client.post(
            "/api/achievements/",
            {
                "title": "New Achievement",
                "body": "New description",
            },
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Achievement")

    def test_retrieve_achievement(self):
        token = self.login()

        response = self.client.get(
            f"/api/achievements/{self.achievement1.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.achievement1.id)

    def test_filter_by_user(self):
        token = self.login()

        response = self.client.get(
            f"/api/achievements/?user_id={self.user1.id}",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.achievement1.id)


class AchievementConfirmationTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@example.com",
            name="User One",
            password="password123",
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com",
            name="User Two",
            password="password123",
        )

        self.achievement = Achievement.objects.create(
            user=self.user1,
            title="Test Achievement",
            body="Test body",
        )

    def login(self, email="user1@example.com", password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_confirm_achievement(self):
        """Test POST /api/achievements/{id}/confirmations/ - potwierdzenie osiągnięcia"""
        token = self.login(email="user2@example.com")

        response = self.client.post(
            f"/api/achievements/{self.achievement.id}/confirmations/",
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            AchievementConfirmation.objects.filter(
                achievement=self.achievement, user=self.user2
            ).exists()
        )

    def test_cannot_confirm_own_achievement(self):
        """Użytkownik nie może potwierdzić własnego osiągnięcia"""
        token = self.login(email="user1@example.com")

        response = self.client.post(
            f"/api/achievements/{self.achievement.id}/confirmations/",
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_confirm_twice(self):
        """Użytkownik nie może potwierdzić tego samego osiągnięcia dwukrotnie"""
        token = self.login(email="user2@example.com")

        # First confirmation
        self.client.post(
            f"/api/achievements/{self.achievement.id}/confirmations/",
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        # Second attempt
        response = self.client.post(
            f"/api/achievements/{self.achievement.id}/confirmations/",
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_confirmations(self):
        """Test GET /api/achievements/{id}/confirmations/ - lista potwierdzeń"""
        AchievementConfirmation.objects.create(
            achievement=self.achievement,
            user=self.user2,
        )

        token = self.login()

        response = self.client.get(
            f"/api/achievements/{self.achievement.id}/confirmations/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_confirmation_count_in_achievement(self):
        """Sprawdź czy confirmation_count jest zwracany w osiągnięciu"""
        token = self.login()

        # Before any confirmations
        response = self.client.get(
            f"/api/achievements/{self.achievement.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(response.data["confirmation_count"], 0)

        # Add confirmation
        AchievementConfirmation.objects.create(
            achievement=self.achievement,
            user=self.user2,
        )

        # After confirmation
        response = self.client.get(
            f"/api/achievements/{self.achievement.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(response.data["confirmation_count"], 1)

