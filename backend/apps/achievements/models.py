from django.db import models
from django.db.models import Count

from apps.teams.models import TeamMember
from apps.users.models import User


class AchievementConfirmationQuerySet(models.QuerySet):

    def with_weighted_score_for_user(self, user):
        user_id = user.pk if hasattr(user, "pk") else user
        user_teams = TeamMember.objects.filter(user_id=user_id).values_list(
            "team_id",
            flat=True,
        )
        shared_team_membership = TeamMember.objects.filter(
            user_id=models.OuterRef("user_id"),
            team_id__in=user_teams,
        )

        return self.annotate(
            confirmer_rank=models.Case(
                models.When(
                    models.Exists(shared_team_membership),
                    then=models.F("user__rank"),
                ),
                default=models.Value(1),
                output_field=models.IntegerField(),
            )
        )

    def within_date_range(self, start, end):
        return self.filter(creation_date__gte=start).filter(creation_date__lte=end)

    def by_team(self, team):
        return self.filter(user__teammember__team=team)


class AchievementQuerySet(models.QuerySet):
    def by_user(self, user):
        return self.filter(user=user)

    def confirmed(self):
        return self.filter(achievementconfirmation__isnull=False).distinct()

    def unconfirmed(self):
        return self.filter(achievementconfirmation__isnull=True)

    def with_confirmation_count(self):
        return self.annotate(confirmation_count=Count("achievementconfirmation"))

    def by_tag(self, tag_text):
        return self.filter(achievementtag__tag__tag_text=tag_text)

    def with_reaction_count(self):
        return self.annotate(reaction_count=Count("achievementreaction"))

    def with_weighted_confirmation_score(self, user):
        weighted_confirmations = (
            AchievementConfirmation.confirmations.with_weighted_score_for_user(user)
            .filter(achievement_id=models.OuterRef("pk"))
            .values("achievement_id")
            .annotate(total=models.Sum("confirmer_rank"))
            .values("total")
        )

        return self.annotate(
            confirmation_score=models.Subquery(
                weighted_confirmations,
                output_field=models.IntegerField(),
            )
        )

    def within_date_range(self, start, end):
        return self.filter(creation_date__gte=start).filter(creation_date__lte=end)

    def by_team(self, team):
        return self.filter(user__teammember__team=team)


class Achievement(models.Model):
    """
    A users achievement
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.TextField()
    body = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    achievements = AchievementQuerySet.as_manager()


class AchievementConfirmation(models.Model):
    """
    User confirming someone else's achievement
    user is validated by a trigger
    """

    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    confirmations = AchievementConfirmationQuerySet.as_manager()


class ConfirmationRequest(models.Model):
    """
    User send this to a second user to confirm their achievement
    receiving_user is validated by a trigger
    """

    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    receiving_user = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)
