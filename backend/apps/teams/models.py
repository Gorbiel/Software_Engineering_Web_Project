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
    rank = models.IntegerField(default=1, validators=[validators.MinValueValidator(0)])