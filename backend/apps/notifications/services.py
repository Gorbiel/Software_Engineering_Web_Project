from apps.achievements.models import Achievement
from apps.glazes.models import Glaze
from apps.notifications.models import Notification
from apps.users.models import User


def create_notification(
    recipient: User,
    notification_type: str,
    title: str,
    message: str,
    sender: User = None,
    achievement: Achievement = None,
    glaze: Glaze = None,
):
    """
    Create a notification for a user
    """
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        achievement=achievement,
        glaze=glaze,
    )


def notify_achievement_created(achievement: Achievement):
    """
    Notify team members when a new achievement is created
    """
    from apps.teams.models import TeamMember

    # Get all team members except the achievement creator
    team_members = (
        TeamMember.objects.filter(team__teammember__user=achievement.user)
        .exclude(user=achievement.user)
        .select_related("user")
        .distinct()
    )

    for member in team_members:
        create_notification(
            recipient=member.user,
            sender=achievement.user,
            notification_type="achievement_created",
            title="New Achievement",
            message=f"{achievement.user.name} posted a new achievement: {achievement.title}",  # noqa: E501
            achievement=achievement,
        )


def notify_achievement_confirmed(achievement: Achievement, confirmer: User):
    """
    Notify achievement owner when their achievement is confirmed
    """
    if achievement.user != confirmer:
        create_notification(
            recipient=achievement.user,
            sender=confirmer,
            notification_type="achievement_confirmed",
            title="Achievement Confirmed",
            message=f"{confirmer.name} confirmed your achievement: {achievement.title}",
            achievement=achievement,
        )


def notify_achievement_reaction(
    achievement: Achievement, reactor: User, reaction_name: str
):
    """
    Notify achievement owner when someone reacts to their achievement
    """
    if achievement.user != reactor:
        create_notification(
            recipient=achievement.user,
            sender=reactor,
            notification_type="achievement_reaction",
            title="New Reaction",
            message=f"{reactor.name} reacted with {reaction_name} to your achievement: {achievement.title}",  # noqa: E501
            achievement=achievement,
        )


def notify_glaze_received(glaze: Glaze):
    """
    Notify user when they receive a glaze (shout-out)
    """
    create_notification(
        recipient=glaze.receiving_user,
        sender=glaze.posting_user,
        notification_type="glaze_received",
        title="New Shout-out",
        message=f"{glaze.posting_user.name} gave you a shout-out: {glaze.title}",
        glaze=glaze,
    )


def notify_glaze_reaction(glaze: Glaze, reactor: User, reaction_name: str):
    """
    Notify glaze poster when someone reacts to their glaze
    """
    if glaze.posting_user != reactor:
        create_notification(
            recipient=glaze.posting_user,
            sender=reactor,
            notification_type="glaze_reaction",
            title="New Reaction",
            message=f"{reactor.name} reacted with {reaction_name} to your shout-out: {glaze.title}",  # noqa: E501
            glaze=glaze,
        )


def notify_confirmation_request(achievement: Achievement, receiving_user: User):
    """
    Notify user when they receive a confirmation request
    """
    create_notification(
        recipient=receiving_user,
        sender=achievement.user,
        notification_type="confirmation_request",
        title="Confirmation Request",
        message=f"{achievement.user.name} requested you to confirm their achievement: {achievement.title}",  # noqa: E501
        achievement=achievement,
    )


# Made with Bob
