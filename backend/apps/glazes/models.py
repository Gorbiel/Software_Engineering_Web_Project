from django.db import models
from django.db.models import Count, Exists, OuterRef

from apps.teams.models import TeamMember
from apps.users.models import User


class GlazeQuerySet(models.QuerySet):
    def sent_by(self, user):
        return self.filter(posting_user=user)

    def received_by(self, user):
        return self.filter(receiving_user=user)

    def by_tag(self, tag_text):
        return self.filter(glazetag__tag__tag_text=tag_text)

    def with_reaction_count(self):
        return self.annotate(reaction_count=Count("glazereaction"))

    def within_date_range(self, start, end):
        return self.filter(creation_date__gte=start).filter(creation_date__lte=end)

    def cross_team(self):
        """Glazes where sender and receiver share no common team"""
        shared_team = TeamMember.objects.filter(
            user=OuterRef("posting_user"),
            team__in=TeamMember.objects.filter(
                user=OuterRef(OuterRef("receiving_user"))
            ).values("team"),
        )
        return self.annotate(same_team=Exists(shared_team)).filter(same_team=False)

    def within_team(self):
        """Glazes where sender and receiver share at least one team"""
        shared_team = TeamMember.objects.filter(
            user=OuterRef("posting_user"),
            team__in=TeamMember.objects.filter(
                user=OuterRef(OuterRef("receiving_user"))
            ).values("team"),
        )
        return self.annotate(same_team=Exists(shared_team)).filter(same_team=True)


class Glaze(models.Model):
    """
    A shout-out from one user to another
    """

    posting_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="poster"
    )
    receiving_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="receiver"
    )
    title = models.TextField()
    body = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    glazes = GlazeQuerySet.as_manager()

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="user_cant_glaze_themself",
                condition=~models.Q(posting_user__exact=models.F("receiving_user")),
            )
        ]
