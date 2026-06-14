import pytest

from apps.teams.models import Team, TeamMember
from apps.users.models import User


@pytest.mark.django_db
def test_rank_enum_and_name_property():
    user = User.objects.create_user(email="u@example.com", name="U", password="pw")
    team = Team.objects.create(name="team-x")

    # Known enum value -> named rank
    tm = TeamMember.objects.create(team=team, user=user, rank=TeamMember.Rank.MID.value)
    assert tm.rank_name == "mid"

    # Custom value -> 'custom'
    tm2 = TeamMember.objects.create(team=team, user=user, rank=42)
    assert tm2.rank_name == "custom"


def test_rank_value_from_name_and_errors():
    assert TeamMember.rank_value_from_name("junior") == TeamMember.Rank.JUNIOR.value
    assert TeamMember.rank_value_from_name("MID") == TeamMember.Rank.MID.value

    try:
        TeamMember.rank_value_from_name(123)  # not a string
        raise AssertionError("Expected ValueError for non-string rank name")
    except ValueError:
        pass

    try:
        TeamMember.rank_value_from_name("unknown-rank")
        raise AssertionError("Expected ValueError for unknown rank name")
    except ValueError:
        pass
