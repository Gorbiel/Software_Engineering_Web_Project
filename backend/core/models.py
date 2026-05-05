from django.db import models
from django.core import validators
from django.views.decorators.http import condition


# Create your models here.

#DB SHEMA: https://dbdiagram.io/d/ioioii-69f0a3beddb9320fdc781aa1

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
            models.CheckConstraint(
                name="inactive_when_deactivation_date_is_not_null",
                condition=(models.Q(active__exact=False) & models.Q(deactivation_date__isnull=False)) |
                          (models.Q(active__exact=True) & models.Q(deactivation_date__isnull=True))
            )
        ]

class Achievement(models.Model):
    """
    A users achievement
    """
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.TextField()
    body = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

class Glaze(models.Model):
    """
    A shout-out from one user to another
    """
    posting_user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")
    receiving_user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="receiver")
    title = models.TextField()
    body = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="user_cant_glaze_themself",
                condition=~models.Q(posting_user_id__exact=models.F('receiving_user_id'))
            )
        ]

class AchievementConfirmation(models.Model):
    """
    User confirming someone else's achievement
    """
    achievement_id = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE) #TODO: create migration trigger so the user cant confirm their own achievement
    creation_date = models.DateTimeField(auto_now_add=True)

class ConfirmationRequest(models.Model):
    """
    User send this to a second user to confirm their achievement
    """
    achievement_id = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    receiving_user_id = models.ForeignKey(User, on_delete=models.CASCADE) # TODO: create migration trigger so the user cant send a confirmtion to themself
    creation_date = models.DateTimeField(auto_now_add=True)

class Team(models.Model):
    """
    Team declaration
    """
    name = models.CharField(max_length=128, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)

class TeamLeader(models.Model):
    """
    Defines a team leader for a team, a user can be a team leader of multiple teams
    and a team can have multiple leaders.
    """
    team_id = models.ForeignKey(Team, on_delete=models.RESTRICT)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

class TeamMember(models.Model):
    """
    Defines a member of a team and their rank in the team.
    Ranks shouldn't be compared between teams.
    """
    team_id = models.ForeignKey(Team, on_delete=models.RESTRICT)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    rank = models.IntegerField(default=1, validators=[validators.MinValueValidator(0)])

class Admin(models.Model):
    """
    Defines a user with administrative privileges in the app.
    """
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

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
    achievement_id = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    tag_id = models.ForeignKey(Tag, on_delete=models.CASCADE)

class GlazeTag(models.Model):
    glaze_id = models.ForeignKey(Glaze, on_delete=models.CASCADE)
    tag_id = models.ForeignKey(Tag, on_delete=models.CASCADE)

class Reaction(models.Model):
    name = models.CharField(max_length=64, unique=True)
    code = models.CharField(max_length=64, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)

class AchievementReaction(models.Model):
    achievement_id = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_id = models.ForeignKey(Reaction, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)

class GlazeReaction(models.Model):
    glaze_id = models.ForeignKey(Glaze, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_id = models.ForeignKey(Reaction, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(auto_now_add=True)