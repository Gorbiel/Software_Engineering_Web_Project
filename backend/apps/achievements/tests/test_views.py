from rest_framework import status
from rest_framework.test import APITestCase

from apps.achievements.models import (
    Achievement,
    AchievementConfirmation,
    ConfirmationRequest,
)
from apps.reactions.models import AchievementReaction, Reaction
from apps.users.models import Admin, User


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
        """
        Test POST /api/achievements/{id}/confirmations/ - potwierdzenie osiągnięcia
        """
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


class AchievementReactionTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com",
            name="Owner",
            password="password123",
        )
        self.reactor = User.objects.create_user(
            email="reactor@example.com",
            name="Reactor",
            password="password123",
        )
        self.achievement = Achievement.objects.create(
            user=self.owner,
            title="Reactable achievement",
            body="Needs a heart",
        )

    def login(self, email="reactor@example.com", password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_add_reaction_to_achievement(self):
        token = self.login()

        response = self.client.post(
            f"/api/achievements/{self.achievement.id}/reactions/",
            {"code": "heart", "name": "Heart"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["reaction"]["code"], "heart")
        self.assertTrue(
            AchievementReaction.objects.filter(
                achievement=self.achievement,
                user=self.reactor,
                reaction__code="heart",
            ).exists()
        )

    def test_adding_same_reaction_twice_is_idempotent(self):
        token = self.login()

        first_response = self.client.post(
            f"/api/achievements/{self.achievement.id}/reactions/",
            {"code": "heart", "name": "Heart"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        second_response = self.client.post(
            f"/api/achievements/{self.achievement.id}/reactions/",
            {"code": "heart", "name": "Heart"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            AchievementReaction.objects.filter(
                achievement=self.achievement,
                user=self.reactor,
                reaction__code="heart",
            ).count(),
            1,
        )

    def test_rejects_unsupported_reaction(self):
        token = self.login()

        response = self.client.post(
            f"/api/achievements/{self.achievement.id}/reactions/",
            {"code": "rocket", "name": "Rocket"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("code", response.data)

    def test_normalizes_thumbs_up_reaction_code(self):
        token = self.login()

        response = self.client.post(
            f"/api/achievements/{self.achievement.id}/reactions/",
            {"code": "thumbs up"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["reaction"]["code"], "thumbs_up")
        self.assertEqual(response.data["reaction"]["emoji"], "👍")

    def test_retrieve_achievement_includes_reaction_count(self):
        token = self.login(email="owner@example.com")
        reaction = Reaction.objects.create(name="Heart", code="heart")
        AchievementReaction.objects.create(
            achievement=self.achievement,
            user=self.reactor,
            reaction=reaction,
        )

        response = self.client.get(
            f"/api/achievements/{self.achievement.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reaction_count"], 1)
        self.assertEqual(len(response.data["reactions"]), 1)

    def test_delete_own_achievement_reaction(self):
        token = self.login()
        reaction = Reaction.objects.create(name="Heart", code="heart")
        achievement_reaction = AchievementReaction.objects.create(
            achievement=self.achievement,
            user=self.reactor,
            reaction=reaction,
        )

        response = self.client.delete(
            f"/api/achievements/{self.achievement.id}/reactions/{achievement_reaction.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            AchievementReaction.objects.filter(id=achievement_reaction.id).exists()
        )

    def test_cannot_delete_someone_elses_achievement_reaction(self):
        owner_token = self.login(email="owner@example.com")
        reaction = Reaction.objects.create(name="Heart", code="heart")
        achievement_reaction = AchievementReaction.objects.create(
            achievement=self.achievement,
            user=self.reactor,
            reaction=reaction,
        )

        response = self.client.delete(
            f"/api/achievements/{self.achievement.id}/reactions/{achievement_reaction.id}/",
            HTTP_AUTHORIZATION=f"Bearer {owner_token}",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(
            AchievementReaction.objects.filter(id=achievement_reaction.id).exists()
        )


class ConfirmationRequestTests(APITestCase):
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
        self.user3 = User.objects.create_user(
            email="user3@example.com",
            name="User Three",
            password="password123",
        )

        self.achievement1 = Achievement.objects.create(
            user=self.user1,
            title="Achievement One",
            body="Body One",
        )
        self.achievement2 = Achievement.objects.create(
            user=self.user3,
            title="Achievement Two",
            body="Body Two",
        )

        ConfirmationRequest.objects.create(
            achievement=self.achievement1,
            receiving_user=self.user2,
        )
        ConfirmationRequest.objects.create(
            achievement=self.achievement2,
            receiving_user=self.user2,
        )
        ConfirmationRequest.objects.create(
            achievement=self.achievement1,
            receiving_user=self.user3,
        )

    def login(self, email="user2@example.com", password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_list_only_requests_received_by_logged_user(self):
        token = self.login(email="user2@example.com")

        response = self.client.get(
            "/api/achievements/confirmation-requests/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertTrue(
            all(item["receiving_user"]["id"] == self.user2.id for item in response.data)
        )
        self.assertIn("requesting_user", response.data[0])
        self.assertIn("achievement_id", response.data[0])


class AchievementModerationTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com",
            name="Owner",
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

        self.achievement = Achievement.objects.create(
            user=self.owner,
            title="Moderated achievement",
            body="Needs moderation",
        )

    def login(self, email, password="password123"):
        response = self.client.post(
            "/api/auth/login/",
            {"email": email, "password": password},
            format="json",
        )
        return response.data["access"]

    def test_admin_can_delete_foreign_achievement(self):
        token = self.login(email="admin@example.com")

        response = self.client.delete(
            f"/api/achievements/{self.achievement.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Achievement.objects.filter(id=self.achievement.id).exists())

    def test_admin_cannot_patch_foreign_achievement(self):
        token = self.login(email="admin@example.com")

        response = self.client.patch(
            f"/api/achievements/{self.achievement.id}/",
            {"title": "Updated by admin"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_owner_non_admin_cannot_delete_foreign_achievement(self):
        token = self.login(email="other@example.com")

        response = self.client.delete(
            f"/api/achievements/{self.achievement.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
