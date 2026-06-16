from django.db import models

from apps.achievements.models import Achievement
from apps.glazes.models import Glaze
from apps.teams.models import Team
from apps.users.models import User


class TagQuerySet(models.QuerySet):
    def global_tags(self):
        """Return only global tags (no team association)"""
        return self.filter(team__isnull=True)

    def team_tags(self, team):
        """Return tags for a specific team"""
        return self.filter(team=team)

    def available_for_team(self, team):
        """Return all tags available for a team (global + team-specific)"""
        if isinstance(team, models.QuerySet) or isinstance(team, (list, tuple, set)):
            return self.filter(models.Q(team__isnull=True) | models.Q(team_id__in=team))
        return self.filter(models.Q(team__isnull=True) | models.Q(team=team))

    def search(self, query):
        """Search tags by text"""
        return self.filter(tag_text__icontains=query)


class Tag(models.Model):
    """
    Defines an achievement/glaze tag.
    Can be global (team=None, created by superadmin) or team-specific.
    """

    tag_text = models.CharField(max_length=64)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="If null, tag is global. Otherwise, tag is team-specific.",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_tags",
    )
    creation_date = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    tags = TagQuerySet.as_manager()

    class Meta:
        # Tag text must be unique within its scope (global or per-team)
        constraints = [
            models.UniqueConstraint(
                fields=["tag_text", "team"],
                name="unique_tag_per_scope",
            )
        ]
        ordering = ["tag_text"]

    def __str__(self):
        scope = f"[{self.team.name}]" if self.team else "[Global]"
        return f"{self.tag_text} {scope}"

    @property
    def is_global(self):
        return self.team is None


class AchievementTag(models.Model):
    """
    Achievements tagged with specific tags.
    Max 5 tags per achievement enforced in serializer/view.
    """

    achievement = models.ForeignKey(
        Achievement, on_delete=models.CASCADE, related_name="achievement_tags"
    )
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["achievement", "tag"]
        ordering = ["added_date"]

    def __str__(self):
        return f"{self.achievement.title} - {self.tag.tag_text}"


class GlazeTag(models.Model):
    """
    Glazes tagged with specific tags.
    Max 5 tags per glaze enforced in serializer/view.
    """

    glaze = models.ForeignKey(
        Glaze, on_delete=models.CASCADE, related_name="glaze_tags"
    )
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["glaze", "tag"]
        ordering = ["added_date"]

    def __str__(self):
        return f"{self.glaze.title} - {self.tag.tag_text}"
