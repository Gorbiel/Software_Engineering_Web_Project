from django.db import models
from django.db.models import Count

from apps.users.models import User


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

    class Meta:
        app_label = "core"


class AchievementConfirmation(models.Model):
    """
        User confirming someone else's achievement
        user is validated by a trigger
    """

    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"


class ConfirmationRequest(models.Model):
    """
        User send this to a second user to confirm their achievement
        receiving_user is validated by a trigger
    """

    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    receiving_user = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"