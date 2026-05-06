from django.core import validators
from django.db import models
from django.db.models import Count

# Create your models here.

#DB SHEMA: https://dbdiagram.io/d/ioioii-69f0a3beddb9320fdc781aa1

class UserQuerySet(models.QuerySet):
    def active(self):
        return self.filter(active=True)

    def inactive(self):
        return self.filter(active=False)

class AchievementQuerySet(models.QuerySet):
    def by_user(self, user):
        return self.filter(user=user)

    def confirmed(self):
        return self.filter(achievementconfirmation__isnull=False).distinct()

    def unconfirmed(self):
        return self.filter(achievementconfirmation__isnull=True)

    def with_confirmation_count(self):
        return self.annotate(confirmation_count=Count('achievementconfirmation'))

    def by_tag(self, tag_text):
        return self.filter(achievementtag__tag__tag_text=tag_text)

    def with_reaction_count(self):
        return self.annotate(reaction_count=Count('achievementreaction'))


class GlazeQuerySet(models.QuerySet):
    def sent_by(self, user):
        return self.filter(posting_user=user)

    def received_by(self, user):
        return self.filter(receiving_user=user)

    def by_tag(self, tag_text):
        return self.filter(glazetag__tag__tag_text=tag_text)

    def with_reaction_count(self):
        return self.annotate(reaction_count=Count('glazereaction'))


class TeamQuerySet(models.QuerySet):
    def with_member_count(self):
        return self.annotate(member_count=Count('teammember'))

    def containing_user(self, user):
        return self.filter(teammember__user=user)

    def led_by(self, user):
        return self.filter(teamleader__user=user)

class User(models.Model):
    """
    Normal user
    name - combined name and surname / username
    creation_date - set automatically
    active - sets the user as active, defaults to True
    deactivation_date - set automatically
    """
    name = models.CharField(max_length=64)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    creation_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    deactivation_date = models.DateTimeField(default=None, blank=True, null=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="deleted_after_created",
                condition=models.Q(creation_date__lt=models.F("deactivation_date")) |
                          models.Q(deactivation_date__isnull=True)
            ),
        ]

    objects = models.Manager()
    users = UserQuerySet.as_manager()

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

class Glaze(models.Model):
    """
    A shout-out from one user to another
    """
    posting_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="poster"
    )
    receiving_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="receiver"
    )
    title = models.TextField()
    body = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="user_cant_glaze_themself",
                condition=~models.Q(posting_user__exact=models.F('receiving_user'))
            )
        ]

    objects = models.Manager()
    glazes = GlazeQuerySet.as_manager()

class AchievementConfirmation(models.Model):
    """
    User confirming someone else's achievement
    user is validated by a trigger
    """
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

class ConfirmationRequest(models.Model):
    """
    User send this to a second user to confirm their achievement
    receiving_user is validated by a trigger
    """
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    receiving_user = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

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

class Admin(models.Model):
    """
    Defines a user with administrative privileges in the app.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class Tag(models.Model):
    """
    Defines an achievent/galze tag
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

class Reaction(models.Model):
    name = models.CharField(max_length=64, unique=True)
    code = models.CharField(max_length=64, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)

class AchievementReaction(models.Model):
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.ForeignKey(Reaction, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

class GlazeReaction(models.Model):
    glaze = models.ForeignKey(Glaze, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.ForeignKey(Reaction, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)