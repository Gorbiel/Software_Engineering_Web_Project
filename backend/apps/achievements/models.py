from django.db import models
from django.db.models import Count
from apps.teams.models import TeamMember
from apps.users.models import User

class AchievementConfirmationQuerySet(models.QuerySet):

    def with_weighted_score_for_user(self, user):
        user_teams = TeamMember.objects.filter(
            user_id=user
        ).values_list('team_id', flat=True)

        confirmer_avg_rank_in_shared_teams = TeamMember.objects.filter(
            user_id=models.OuterRef('user_id'),
            team_id__in=user_teams
        ).values('user_id').annotate(
            avg_rank=models.Avg('rank')
        ).values('avg_rank')

        return (
            self.annotate(
                rank=models.Case(
                    models.When(
                        user_id__teammember__team_id__in=user_teams,
                        then=models.Subquery(confirmer_avg_rank_in_shared_teams[:1])
                    ),
                    default=models.Value(1),
                    output_field=models.IntegerField()
                )
            )
        )

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
        return self.annotate(
            confirmation_score=(
                AchievementConfirmation.confirmations.with_weighted_score_for_user(user)
                .filter(achievement_id="id")
                .aggregate(models.Sum("rank"))
            )
        )


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
