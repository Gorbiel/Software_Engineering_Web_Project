from django.db import models
from django.db.models import Count

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