import pytest

from apps.teams.models import Team, TeamMember
from apps.users.models import User


@pytest.mark.django_db
def test_team_member_links_user_to_team():
    user = User.objects.create_user(email="u@example.com", name="U", password="pw")
    team = Team.objects.create(name="team-x")

    tm = TeamMember.objects.create(team=team, user=user)

    assert tm.team == team
    assert tm.user == user
