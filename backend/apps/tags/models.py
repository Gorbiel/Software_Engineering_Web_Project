from django.db import models

from apps.achievements.models import Achievement
from apps.glazes.models import Glaze


class Tag(models.Model):
    """
    Defines an achievent/glaze tag
    """

    tag_text = models.CharField(max_length=64, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)


class AchievementTag(models.Model):
    """
    Achievements tagged with specific tags
    """

    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)


class GlazeTag(models.Model):
    glaze = models.ForeignKey(Glaze, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
