from django.core import validators
from django.db import models
from django.db.models import Count

from apps.users.models import User, UserQuerySet, Admin
from apps.teams.models import Team, TeamQuerySet, TeamLeader, TeamMember
from apps.glazes.models import Glaze, GlazeQuerySet
from apps.achievements.models import (
    Achievement,
    AchievementQuerySet,
    AchievementConfirmation,
    ConfirmationRequest,
)
from apps.reactions.models import (
    Reaction,
    AchievementReaction,
    GlazeReaction,
)
from apps.tags.models import (
    Tag,
    AchievementTag,
    GlazeTag,
)

# DB SHEMA: https://dbdiagram.io/d/ioioii-69f0a3beddb9320fdc781aa1
