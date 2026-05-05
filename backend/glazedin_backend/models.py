from django.db import models

# Create your models here.

#DB SHEMA: https://dbdiagram.io/d/ioioii-69f0a3beddb9320fdc781aa1

class User(models.Model):
    """
    Normal user
    name - combined name and surname / username
    active - sets the user as active, defaults to True
    deactivation_date - set this field when deactivating the user
    """
    name = models.CharField(max_length=64)
    email = models.EmailField()
    password = models.CharField(max_length=128)
    creation_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    deactivation_date = models.DateTimeField(default=None) #TODO: Może się da o jakoś triggerem zrobić

class Achievement(models.Model):
    """
    A users achievement
    """
    user_id = models.ForeignKey(User)
    title = models.TextField()
    body = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

class Glaze(models.Model):
    """
    A shout-out from one user to another
    """
    posting_user_id = models.ForeignKey(User)
    receiving_user_id = models.ForeignKey(User)
    title = models.TextField()
    body = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)

class AchievementConfirmation(models.Model):
    """
    User confirming someone else's achievement
    """
    achievement_id = models.ForeignKey(Achievement)
    user_id = models.ForeignKey(User)
    creation_date = models.DateTimeField(auto_now_add=True)

class ConfirmationRequest(models.Model):
    """
    User send this to a second user to confirm their achievement
    """
    achievement_id = models.ForeignKey(Achievement)
    receiving_user_id = models.ForeignKey(User)
    creation_date = models.DateTimeField(auto_now_add=True)

class Team(models.Model):
    """
    Team declaration
    """
    name = models.CharField(max_length=128)
    creation_date = models.DateTimeField(auto_now_add=True)

class TeamLeader(models.Model):
    """
    Defines a team leader for a team, a user can be a team leader of multiple teams
    and a team can have multiple leaders.
    """
    team_id = models.ForeignKey(Team)
    user_id = models.ForeignKey(User)

class TeamMember(models.Model):
    """
    Defines a member of a team and their rank in the team.
    Ranks shouldn't be compared between teams.
    """
    team_id = models.ForeignKey(Team)
    user_id = models.ForeignKey(User)
    rank = models.IntegerField(default=1)

class Admin(models.Model):
    """
    Defines a user with administrative privileges in the app.
    """
    user_id = models.ForeignKey(User)

class Tag(models.Model):
    """
    Defines an achievent/galze tag
    """
    tag_text = models.CharField(max_length=64)
    creation_date = models.DateTimeField(auto_now_add=True)

class AchievementTag(models.Model):
    """
    Achievements tagged with specific tags
    """
    achievement_id = models.ForeignKey(Achievement)
    tag_id = models.ForeignKey(Tag)

class GlazeTag(models.Model):
    glaze_id = models.ForeignKey(Glaze)
    tag_id = models.ForeignKey(Tag)

class Reaction(models.Model):
    name = models.CharField(max_length=64)
    code = models.CharField(max_length=64)
    creation_date = models.DateTimeField(auto_now_add=True)

class AchievementReaction(models.Model):
    achievement_id = models.ForeignKey(Achievement)
    reaction_id = models.ForeignKey(Reaction)
    creation_date = models.DateTimeField(auto_now_add=True)

class GlazeReaction(models.Model):
    glaze_id = models.ForeignKey(Glaze)
    reaction_id = models.ForeignKey(Reaction)
    creation_date = models.DateTimeField(auto_now_add=True)