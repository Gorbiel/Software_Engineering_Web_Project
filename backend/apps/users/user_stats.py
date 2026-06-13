from django.core.cache import cache
from django.db.models import Count, Sum

from apps.achievements.models import Achievement, AchievementConfirmation
from apps.glazes.models import Glaze
from apps.reactions.models import AchievementReaction, GlazeReaction
from apps.tags.models import GlazeTag
from apps.users.models import User


def get_user_stats(user: User) -> dict:
    cache_key = f"user_stats_{user.id}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    stats = {}

    # --- Achievements ---
    user_achievements = Achievement.achievements.by_user(user)

    stats["achievement_count"] = user_achievements.count()

    stats["latest_achievements"] = [
        a.id for a in user_achievements.order_by("-creation_date")[:5]
    ]

    stats["achievement_confirmation_scores"] = [
        {"achievement_id": a.id, "confirmation_count": a.confirmation_count}
        for a in user_achievements.with_weighted_confirmation_score(user)
    ]

    stats["achievement_reaction_counts"] = [
        {"achievement_id": a.id, "reaction_count": a.reaction_count}
        for a in user_achievements.with_reaction_count()
    ]

    stats["top_achievement_confirming_users"] = [
        {"user_id": c["user"], "confirmation_count": c["amount_confirmed"]}
        for c in AchievementConfirmation.confirmations
        .filter(achievement__user=user)
        .with_weighted_score_for_user(user)
        .values("user")
        .annotate(amount_confirmed=Sum("confirmer_rank"))
        .order_by("-amount_confirmed")[:3]
    ]

    stats["top_achievement_reactions"] = [
        {"reaction_id": r["reaction"], "reaction_count": r["reaction_amount"]}
        for r in AchievementReaction.objects
        .filter(achievement__user=user)
        .values("reaction")
        .annotate(reaction_amount=Count("id"))
        .order_by("-reaction_amount")[:3]
    ]

    stats["total_confirmations"] = (
        user_achievements
        .with_weighted_confirmation_score(user)
        .aggregate(total=Sum("confirmation_score"))
    )["total"] or 0

    # --- Received glazes ---
    received_glazes = Glaze.glazes.received_by(user)

    stats["received_glaze_count"] = received_glazes.count()

    stats["latest_received_glazes"] = [
        g.id for g in received_glazes.order_by("-creation_date")[:5]
    ]

    stats["most_glazed_by"] = [
        {"user_id": g["posting_user"], "glaze_count": g["glaze_count"]}
        for g in received_glazes
        .values("posting_user")
        .annotate(glaze_count=Count("id"))
        .order_by("-glaze_count")[:5]
    ]

    stats["top_received_glaze_reactions"] = [
        {"reaction_id": r["reaction"], "reaction_count": r["reaction_count"]}
        for r in GlazeReaction.objects
        .filter(glaze__receiving_user=user)
        .values("reaction")
        .annotate(reaction_count=Count("id"))
        .order_by("-reaction_count")[:5]
    ]

    stats["top_received_glaze_tags"] = [
        {"tag_id": r["tag"], "tag_count": r["tag_count"]}
        for r in GlazeTag.objects
        .filter(glaze__receiving_user=user)
        .values("tag")
        .annotate(tag_count=Count("id"))
        .order_by("-tag_count")[:5]
    ]

    # --- Sent glazes ---
    sent_glazes = Glaze.glazes.sent_by(user)

    stats["sent_glaze_count"] = sent_glazes.count()

    stats["latest_sent_glazes"] = [
        g.id for g in sent_glazes.order_by("-creation_date")[:5]
    ]

    stats["top_sent_glaze_reactions"] = [
        {"reaction_id": r["reaction"], "reaction_count": r["reaction_count"]}
        for r in GlazeReaction.objects
        .filter(glaze__posting_user=user)
        .values("reaction")
        .annotate(reaction_count=Count("id"))
        .order_by("-reaction_count")[:5]
    ]

    cache.set(cache_key, stats, timeout=300)
    return stats