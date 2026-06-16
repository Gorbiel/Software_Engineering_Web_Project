from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.tags.models import Tag
from apps.teams.models import Team, TeamLeader, TeamMember
from apps.users.models import User


class TagViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password="password123",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            name="Other User",
            password="password123",
        )
        self.member_user = User.objects.create_user(
            email="member@example.com",
            name="Member User",
            password="password123",
        )
        self.team = Team.objects.create(name="Engineering")
        self.other_team = Team.objects.create(name="Design")
        TeamMember.objects.create(user=self.user, team=self.team)
        TeamMember.objects.create(user=self.member_user, team=self.team)
        TeamLeader.objects.create(user=self.user, team=self.team)

        self.global_tag = Tag.objects.create(
            tag_text="Helpful",
            created_by=self.user,
        )
        self.team_tag = Tag.objects.create(
            tag_text="Backend",
            team=self.team,
            created_by=self.user,
        )
        self.unavailable_tag = Tag.objects.create(
            tag_text="Design",
            team=self.other_team,
            created_by=self.other_user,
        )

    def authenticate_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_user_can_list_global_tags(self):
        self.authenticate_as(self.user)

        response = self.client.get("/api/tags/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tag_ids = {tag["id"] for tag in response.data}
        self.assertIn(self.global_tag.id, tag_ids)
        self.assertNotIn(self.team_tag.id, tag_ids)
        self.assertNotIn(self.unavailable_tag.id, tag_ids)

    def test_user_can_search_global_tags(self):
        self.authenticate_as(self.user)

        response = self.client.get("/api/tags/search/", {"q": "help"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["id"], self.global_tag.id)

    def test_anonymous_user_cannot_list_tags(self):
        response = self.client.get("/api/tags/")

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_authenticated_user_can_create_global_tag(self):
        self.authenticate_as(self.user)

        response = self.client.post(
            "/api/tags/",
            {"tag_text": "Review"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Tag.objects.filter(tag_text="Review", team__isnull=True).exists()
        )

    def test_team_scoped_tag_creation_is_rejected(self):
        self.authenticate_as(self.member_user)

        response = self.client.post(
            "/api/tags/",
            {"tag_text": "Frontend", "team": self.team.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Tag.objects.filter(tag_text="Frontend").exists())
