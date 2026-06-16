from rest_framework import status
from rest_framework.test import APITestCase

from apps.teams.models import Team, TeamLeader, TeamMember
from apps.users.models import User


class TeamRankApiTests(APITestCase):
    def setUp(self):
        # leader who will perform rank updates
        self.leader = User.objects.create_user(
            email="leader@example.com", name="Leader", password="password123"
        )
        # regular member whose rank will be changed
        self.member = User.objects.create_user(
            email="member@example.com", name="Member", password="password123"
        )
        # other user without privileges
        self.other = User.objects.create_user(
            email="other@example.com", name="Other", password="password123"
        )

        self.team = Team.objects.create(name="team-api")
        TeamLeader.objects.create(team=self.team, user=self.leader)
        TeamMember.objects.create(team=self.team, user=self.member, rank=1)

    def login_and_get_access(self, user):
        resp = self.client.post(
            "/api/auth/login/",
            {"email": user.email, "password": "password123"},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        return resp.data["access"]

    def test_leader_can_update_rank_by_name(self):
        access = self.login_and_get_access(self.leader)

        url = f"/api/teams/{self.team.id}/members/{self.member.id}/rank/"
        resp = self.client.patch(
            url,
            {"rank": "senior"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["rank_name"], "senior")
        self.assertEqual(resp.data["rank"], TeamMember.Rank.SENIOR.value)

    def test_leader_can_update_rank_by_number(self):
        access = self.login_and_get_access(self.leader)

        url = f"/api/teams/{self.team.id}/members/{self.member.id}/rank/"
        resp = self.client.patch(
            url,
            {"rank": 10},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["rank_name"], "junior")

    def test_non_leader_cannot_update(self):
        access = self.login_and_get_access(self.other)

        url = f"/api/teams/{self.team.id}/members/{self.member.id}/rank/"
        resp = self.client.patch(
            url,
            {"rank": "mid"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )

        self.assertIn(
            resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )
