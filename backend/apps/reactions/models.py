from django.db import models

from apps.users.models import User
from apps.glazes.models import Glaze
from apps.achievements.models import Achievement


class Reaction(models.Model):
    name = models.CharField(max_length=64, unique=True)
    code = models.CharField(max_length=64, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"


class AchievementReaction(models.Model):
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.ForeignKey(Reaction, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"


class GlazeReaction(models.Model):
    glaze = models.ForeignKey(Glaze, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.ForeignKey(Reaction, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "core"