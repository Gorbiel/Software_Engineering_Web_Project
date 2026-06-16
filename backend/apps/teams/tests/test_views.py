from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.teams.models import Team, TeamLeader, TeamMember
from apps.users.models import Admin, User


class TeamManagementViewTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            name="Admin User",
            password="password123",
        )
        Admin.objects.create(user=self.admin_user)

        self.leader_user = User.objects.create_user(
            email="leader@example.com",
            name="Leader User",
            password="password123",
        )
        self.other_leader_user = User.objects.create_user(
            email="other-leader@example.com",
            name="Other Leader User",
            password="password123",
        )
        self.member_user = User.objects.create_user(
            email="member@example.com",
            name="Member User",
            password="password123",
        )
        self.normal_user = User.objects.create_user(
            email="normal@example.com",
            name="Normal User",
            password="password123",
        )

        self.team = Team.objects.create(name="Managed Team")
        self.other_team = Team.objects.create(name="Other Team")
        TeamLeader.objects.create(team=self.team, user=self.leader_user)
        TeamLeader.objects.create(team=self.other_team, user=self.other_leader_user)

    def authenticate_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_admin_can_list_all_teams(self):
        self.authenticate_as(self.admin_user)

        response = self.client.get("/api/teams/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_leader_lists_only_led_teams(self):
        self.authenticate_as(self.leader_user)

        response = self.client.get("/api/teams/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.team.id)

    def test_non_leader_cannot_list_teams(self):
        self.authenticate_as(self.normal_user)

        response = self.client.get("/api/teams/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_team(self):
        self.authenticate_as(self.admin_user)

        response = self.client.post(
            "/api/teams/",
            {"name": "New Team"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Team.objects.filter(name="New Team").exists())

    def test_leader_cannot_create_team(self):
        self.authenticate_as(self.leader_user)

        response = self.client.post(
            "/api/teams/",
            {"name": "New Team"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_leader_can_update_own_team(self):
        self.authenticate_as(self.leader_user)

        response = self.client.patch(
            f"/api/teams/{self.team.id}/",
            {"name": "Renamed Team"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.team.refresh_from_db()
        self.assertEqual(self.team.name, "Renamed Team")

    def test_leader_cannot_update_other_team(self):
        self.authenticate_as(self.leader_user)

        response = self.client.patch(
            f"/api/teams/{self.other_team.id}/",
            {"name": "Renamed Team"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_leader_can_add_member_to_own_team(self):
        self.authenticate_as(self.leader_user)

        response = self.client.post(
            f"/api/teams/{self.team.id}/members/",
            {"user_id": self.member_user.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            TeamMember.objects.filter(
                team=self.team,
                user=self.member_user,
            ).exists()
        )

    def test_leader_cannot_add_member_to_other_team(self):
        self.authenticate_as(self.leader_user)

        response = self.client.post(
            f"/api/teams/{self.other_team.id}/members/",
            {"user_id": self.member_user.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_add_leader_to_any_team(self):
        self.authenticate_as(self.admin_user)

        response = self.client.post(
            f"/api/teams/{self.team.id}/leaders/",
            {"user_id": self.normal_user.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            TeamLeader.objects.filter(
                team=self.team,
                user=self.normal_user,
            ).exists()
        )

    def test_leader_can_remove_member_from_own_team(self):
        TeamMember.objects.create(team=self.team, user=self.member_user)
        self.authenticate_as(self.leader_user)

        response = self.client.delete(
            f"/api/teams/{self.team.id}/members/{self.member_user.id}/",
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            TeamMember.objects.filter(
                team=self.team,
                user=self.member_user,
            ).exists()
        )

    def test_legacy_team_route_still_works(self):
        self.authenticate_as(self.leader_user)

        response = self.client.get(f"/api/teams/team/{self.team.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.team.id)
