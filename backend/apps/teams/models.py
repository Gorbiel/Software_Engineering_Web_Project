import enum

from django.core import validators
from django.db import models
from django.db.models import Count

from apps.users.models import User


class TeamQuerySet(models.QuerySet):
    def with_member_count(self):
        return self.annotate(member_count=Count("teammember"))

    def containing_user(self, user):
        return self.filter(teammember__user=user)

    def led_by(self, user):
        return self.filter(teamleader__user=user)


class Team(models.Model):
    """
    Team declaration
    """

    name = models.CharField(max_length=128, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    teams = TeamQuerySet.as_manager()


class TeamLeader(models.Model):
    """
    Defines a team leader for a team, a user can be a team leader of multiple teams
    and a team can have multiple leaders.
    """

    team = models.ForeignKey(Team, on_delete=models.RESTRICT)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class TeamMember(models.Model):
    """
    Defines a member of a team and their rank in the team.
    Ranks shouldn't be compared between teams.
    """

    team = models.ForeignKey(Team, on_delete=models.RESTRICT)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Rank within a team. 1 is lowest, 100 is highest. Ranks are not comparable
    # across different teams.
    rank = models.IntegerField(
        default=1,
        validators=[validators.MinValueValidator(1), validators.MaxValueValidator(100)],
    )

    class Rank(enum.IntEnum):
        DEFAULT = 1
        JUNIOR = 10
        MID = 50
        SENIOR = 90
        LEAD = 100

    @property
    def rank_name(self) -> str:
        """Return the textual name for the stored numeric rank.

        Falls back to 'custom' for values that are not defined in the Rank enum.
        """
        try:
            return self.Rank(self.rank).name.lower()
        except ValueError:
            return "custom"

    @classmethod
    def rank_value_from_name(cls, name: str) -> int:
        """Convert a rank name (case-insensitive) to its integer value.

        Raises ValueError if the name is not a known rank.
        """
        if not isinstance(name, str):
            raise ValueError("rank name must be a string")
        try:
            return cls.Rank[name.strip().upper()].value
        except KeyError:
            raise ValueError(f"Unknown rank name: {name}")
