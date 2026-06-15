from rest_framework import status
from rest_framework.test import APITestCase

from apps.reactions.models import Reaction
from apps.users.models import User


class ReactionListViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="reactions@example.com",
            name="Reactions User",
            password="password123",
        )

    def login(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "reactions@example.com", "password": "password123"},
            format="json",
        )
        return response.data["access"]

    def test_returns_allowed_reactions(self):
        token = self.login()

        response = self.client.get(
            "/api/reactions/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [reaction["code"] for reaction in response.data],
            ["heart", "clap", "fire", "laugh", "thumbs_up"],
        )
        self.assertEqual(response.data[0]["emoji"], "❤️")
        self.assertEqual(Reaction.objects.count(), 5)
