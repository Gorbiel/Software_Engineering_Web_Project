from django.core import validators
from django.db import models
from django.db.models import Count, ExpressionWrapper, F, FloatField, Q, OuterRef
from django.utils import timezone

from apps.users.models import User


class TeamQuerySet(models.QuerySet):
    def with_member_count(self):
        return self.annotate(member_count=Count("teammember", distinct=True))

    def containing_user(self, user):
        return self.filter(teammember__user=user)

    def led_by(self, user):
        return self.filter(teamleader__user=user)

    def with_engagement(self, start=None, end=None):
        # Build date filters if a range is provided
        end = end or timezone.now()
        achievement_filter = Q()
        glaze_sent_filter  = Q()
        glaze_recv_filter  = Q()
        confirmation_filter = Q()

        if start:
            achievement_filter  &= Q(
                teammember__user__achievement__creation_date__gte=start
            )
            glaze_sent_filter   &= Q(
                teammember__user__poster__creation_date__gte=start
            )
            glaze_recv_filter   &= Q(
                teammember__user__receiver__creation_date__gte=start
            )
            confirmation_filter &= Q(
                teammember__user__achievementconfirmation__creation_date__gte=start
            )
        if end:
            achievement_filter  &= Q(
                teammember__user__achievement__creation_date__lte=end
            )
            glaze_sent_filter   &= Q(
                teammember__user__poster__creation_date__lte=end
            )
            glaze_recv_filter   &= Q(
                teammember__user__receiver__creation_date__lte=end
            )
            confirmation_filter &= Q(
                teammember__user__achievementconfirmation__creation_date__lte=end
            )

        return self.annotate(
            member_count=Count("teammember__user", distinct=True),

            # achievements posted by team members
            achievements_count=Count(
                "teammember__user__achievement",
                filter=achievement_filter,
                distinct=True
            ),
            # glazes sent by team members
            glazes_sent_count=Count(
                "teammember__user__poster",
                filter=glaze_sent_filter,
                distinct=True
            ),
            # glazes received by team members
            glazes_received_count=Count(
                "teammember__user__receiver",
                filter=glaze_recv_filter,
                distinct=True
            ),
            # confirmations given by team members
            confirmations_count=Count(
                "teammember__user__achievementconfirmation",
                filter=confirmation_filter,
                distinct=True
            ),
        )

    def with_participation_rate(self, start=None, end=None):
        """% of team members who posted at least one achievement in the period"""
        end = end or timezone.now()
        achievement_filter = Q()
        if start:
            achievement_filter &= Q(
                teammember__user__achievement__creation_date__gte=start
            )
        if end:
            achievement_filter &= Q(
                teammember__user__achievement__creation_date__lte=end
            )

        return self.annotate(
            member_count=Count("teammember__user", distinct=True),
            active_members=Count(
                "teammember__user__achievement__user",
                filter=achievement_filter,
                distinct=True
            ),
        ).annotate(
            participation_rate=ExpressionWrapper(
                F("active_members") * 100.0 / F("member_count"),
                output_field=FloatField()
            )
        )

    def with_cross_team_engagement(self, start=None, end=None):
        end = end or timezone.now()

        from apps.glazes.models import Glaze  # avoid circular import

        # Glazes sent TO this team's members FROM outside the team
        cross_team_received = Glaze.glazes.cross_team().filter(
            receiving_user__teammember__team=OuterRef("pk"),
        )
        if start:
            cross_team_received = cross_team_received.filter(creation_date__gte=start)
        cross_team_received = cross_team_received.filter(creation_date__lte=end)

        # Glazes sent BY this team's members TO outside the team
        cross_team_sent = Glaze.glazes.cross_team().filter(
            posting_user__teammember__team=OuterRef("pk"),
        )
        if start:
            cross_team_sent = cross_team_sent.filter(creation_date__gte=start)
        cross_team_sent = cross_team_sent.filter(creation_date__lte=end)

        return self.annotate(
            cross_team_glazes_received=Count(
                "teammember__user__receiver",
                filter=Q(
                    teammember__user__receiver__in=Glaze.glazes.cross_team().values(
                        "id"
                    )
                ),
                distinct=True,
            ),
            cross_team_glazes_sent=Count(
                "teammember__user__poster",
                filter=Q(
                    teammember__user__poster__in=Glaze.glazes.cross_team().values("id")
                ),
                distinct=True,
            ),
        )


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
