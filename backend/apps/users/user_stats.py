from django.db.models import Count, Sum

from apps.achievements.models import Achievement, AchievementConfirmation
from apps.glazes.models import Glaze
from apps.reactions.models import AchievementReaction, GlazeReaction
from apps.tags.models import GlazeTag
from apps.users.models import User


def get_user_stats(user: User):
    """
    Function for getting the users statistics
    :param user: User object
    :return: dict: Dictionary formated like a json object containing the users stats
    """

    stats = {}

    stats["achievement_count"] = Achievement.achievements.by_user(user).count()

    stats["latest_achievements"] = [
        a.id
        for a in Achievement
        .achievements
        .by_user(user)
        .order_by("-creation_date")[:5]
    ]

    stats["achievement_confirmation_scores"] = [
        {"achievement_id": a.id,
         "confirmation_count": a.confirmation_count}
        for a in Achievement
                .achievements
                .by_user(user)
                .with_weighted_confirmation_score(user)
    ]

    stats["top_achievement_confirming_users"] = [
        {"user": c["user"], "confirmation_count": c["amount_confirmed"]}
        for c in AchievementConfirmation
            .confirmations
            .filter(achievement__user__exact = user)
            .with_weighted_score_for_user(user)
            .values("user")
            .annotate(amount_confirmed = Sum("confirmer_rank"))
            .order_by("-amount_confirmed")[:3]
    ]

    stats["achievement_reaction_counts"] = [
        {"achievement_id":a.id, "reaction_count":a.reaction_count}
        for a in Achievement
        .achievements
        .with_reaction_count()
        .filter(user__exact=user)
    ]

    stats["top_achievement_reactions"] = [
        {"reaction_id":r["reaction"], "reaction_count":r["reaction_amount"]}
        for r in AchievementReaction
            .objects
            .filter(achievement__user__exact = user)
            .values("reaction")
            .annotate(reaction_amount = Count('id'))
            .order_by("-reaction_amount")[:3]
    ]

    stats["received_glaze_count"] = Glaze.glazes.received_by(user).count()

    stats["latest_received_glazes"] = [
        g.id
        for g in Glaze
        .glazes
        .received_by(user)
        .order_by("-creation_date")[:5]
    ]

    stats["most_glazed_by"] = [
        {"user_id":g["posting_user"], "glaze_count":g["glaze_count"]}
        for g in Glaze
            .glazes
            .received_by(user)
            .values("posting_user")
            .annotate(glaze_count = Count('id'))
            .order_by("-glaze_count")[:5]
    ]

    stats["top_received_glaze_reactions"] = [
        {"reaction_id":r["reaction"], "reaction_count":r["reaction_count"]}
        for r in GlazeReaction
            .objects
            .filter(glaze__receiving_user__exact = user)
            .values("reaction")
            .annotate(reaction_count = Count('id'))
            .order_by("-reaction_count")[:5]
    ]

    stats["top_received_glaze_tags"] = [
        {"tag_id": r["tag"], "tag_count": r["tag_count"]}
        for r in GlazeTag
        .objects
        .filter(glaze__receiving_user__exact=user)
        .values("tag")
        .annotate(tag_count=Count('id'))
        .order_by("-tag_count")[:5]
    ]

    stats["sent_glaze_count"] = Glaze.glazes.sent_by(user).count()

    stats["latest_sent_glazes"] = [
        g.id
        for g in Glaze
        .glazes
        .sent_by(user)
        .order_by("-creation_date")[:5]
    ]

    stats["top_sent_glaze_reactions"] = [
        {"reaction_id": r["reaction"], "reaction_count": r["reaction_count"]}
        for r in GlazeReaction
        .objects
        .filter(glaze__posting_user__exact=user)
        .values("reaction")
        .annotate(reaction_count=Count('id'))
        .order_by("-reaction_count")[:5]
    ]

    stats["total_confirmations"] = (Achievement.achievements
        .by_user(user)
        .with_weighted_confirmation_score(user)
        .aggregate(Sum('confirmation_score')))["confirmation_score__sum"]

    return stats