from collections import defaultdict
from datetime import datetime, timedelta

from django.db.models import (
    Count,
    ExpressionWrapper,
    F,
    IntegerField,
    OuterRef,
    Q,
    Subquery,
    Sum,
)
from django.db.models.functions import Coalesce, TruncDay
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.achievements.models import Achievement, AchievementConfirmation
from apps.glazes.models import Glaze
from apps.tags.models import Tag
from apps.teams.models import Team
from apps.users.models import User
from common.permissions import IsGlazedInAdmin


class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsGlazedInAdmin]

    @action(detail=False, methods=["get"])
    def general(self, request):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        if not date_from or not date_to:
            return Response(
                {"error": "date_from and date_to are required (YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            date_from = timezone.make_aware(datetime.strptime(date_from, "%Y-%m-%d"))
            date_to = timezone.make_aware(
                datetime.strptime(date_to, "%Y-%m-%d")
            ) + timedelta(days=1)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = {}

        achievements_with_confirmation_counts = (
            Achievement.achievements.within_date_range(date_from, date_to)
            .with_confirmation_count()
            .annotate(day=TruncDay("creation_date"))
        )

        achievements_with_reaction_counts = (
            Achievement.achievements.within_date_range(date_from, date_to)
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        achievements_base = Achievement.achievements.within_date_range(
            date_from, date_to
        ).annotate(day=TruncDay("creation_date"))

        confirmations_in_period = (
            AchievementConfirmation.confirmations.within_date_range(
                date_from, date_to
            ).annotate(day=TruncDay("creation_date"))
        )

        report["daily_achievement_counts"] = list(
            achievements_base.values("day").annotate(total=Count("id")).order_by("day")
        )

        report["daily_achievement_confirmations"] = list(
            achievements_with_confirmation_counts.values("day")
            .annotate(total=Sum("achievementconfirmation"))
            .order_by("day")
        )

        report["daily_achievement_reactions"] = list(
            achievements_with_reaction_counts.values("day")
            .annotate(total=Sum("achievementreaction"))
            .order_by("day")
        )

        glazes_in_period = (
            Glaze.glazes.within_date_range(date_from, date_to)
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        achievement_by_day = (
            achievements_base.values("day")
            .annotate(users=Count("user_id", distinct=True))
            .order_by("day")
        )

        confirmation_by_day = (
            confirmations_in_period.values("day")
            .annotate(users=Count("user_id", distinct=True))
            .order_by("day")
        )

        glaze_by_day = (
            glazes_in_period.values("day")
            .annotate(users=Count("posting_user_id", distinct=True))
            .order_by("day")
        )

        # Merge by summing per day
        daily_totals = defaultdict(int)

        for row in achievement_by_day:
            daily_totals[row["day"]] += row["users"]

        for row in confirmation_by_day:
            daily_totals[row["day"]] += row["users"]

        for row in glaze_by_day:
            daily_totals[row["day"]] += row["users"]

        report["active_user_daily_count"] = [
            {"day": day, "active_users": count}
            for day, count in sorted(daily_totals.items())
        ]

        received_count = (
            glazes_in_period.filter(receiving_user=OuterRef("pk"))
            .values("receiving_user")
            .annotate(c=Count("id"))
            .values("c")
        )

        sent_count = (
            glazes_in_period.filter(posting_user=OuterRef("pk"))
            .values("posting_user")
            .annotate(c=Count("id"))
            .values("c")
        )

        users_with_glaze_counts = User.objects.annotate(
            received_glaze_count=Coalesce(Subquery(received_count), 0),
            sent_glaze_count=Coalesce(Subquery(sent_count), 0),
        )

        report["most_glazed_users"] = list(
            users_with_glaze_counts.order_by("-received_glaze_count").values(
                "id", "name", "received_glaze_count"
            )[:10]
        )

        report["best_glazing_users"] = list(
            users_with_glaze_counts.order_by("-sent_glaze_count").values(
                "id", "name", "sent_glaze_count"
            )[:10]
        )

        teams_with_engagement_data = (
            Team.teams.with_engagement(date_from, date_to)
            .with_participation_rate(date_from, date_to)
            .with_cross_team_engagement(date_from, date_to)
        )

        report["teams_with_most_achivemnents"] = list(
            teams_with_engagement_data.order_by("-achievements_count").values(
                "id", "name", "achievements_count"
            )[:10]
        )

        report["teams_with_most_recived_glazes"] = list(
            teams_with_engagement_data.order_by("-glazes_received_count").values(
                "id", "name", "glazes_received_count"
            )[:10]
        )

        report["teams_with_most_sent_glazes"] = list(
            teams_with_engagement_data.order_by("-glazes_sent_count").values(
                "id", "name", "glazes_sent_count"
            )[:10]
        )

        report["teams_with_most_confirmations"] = list(
            teams_with_engagement_data.order_by("-confirmations_count").values(
                "id", "name", "confirmations_count"
            )[:10]
        )

        report["most_active_teams"] = list(
            teams_with_engagement_data.order_by("-participation_rate").values(
                "id", "name", "participation_rate"
            )
        )

        report["teams_with_most_cross_team_engagment"] = list(
            teams_with_engagement_data.annotate(
                cross_team_sum=ExpressionWrapper(
                    F("cross_team_glazes_received") + F("cross_team_glazes_sent"),
                    output_field=IntegerField(),
                )
            )
            .order_by("-cross_team_sum")
            .values("id", "name", "cross_team_sum")[:10]
        )

        report["probable_siloed_teams"] = list(
            teams_with_engagement_data.annotate(
                cross_team_sum=ExpressionWrapper(
                    F("cross_team_glazes_received") + F("cross_team_glazes_sent"),
                    output_field=IntegerField(),
                )
            )
            .order_by("cross_team_sum")
            .values("id", "name", "cross_team_sum")[:10]
        )

        report["top_achievement_tags"] = list(
            Tag.objects.annotate(
                usage_count=Count(
                    "achievementtag",
                    filter=Q(
                        achievementtag__achievement__creation_date__range=(
                            date_from,
                            date_to,
                        )
                    ),
                    distinct=True,
                )
            )
            .order_by("-usage_count")
            .values("tag_text", "usage_count")[:10]
        )

        report["top_glaze_tags"] = list(
            Tag.objects.annotate(
                usage_count=Count(
                    "glazetag",
                    filter=Q(
                        glazetag__glaze__creation_date__range=(date_from, date_to)
                    ),
                    distinct=True,
                )
            )
            .order_by("-usage_count")
            .values("tag_text", "usage_count")[:10]
        )

        return JsonResponse(report)

    @action(detail=True, methods=["get"])
    def user(self, request, pk=None):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        if not date_from or not date_to:
            return Response(
                {"error": "date_from and date_to are required (YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            date_from = timezone.make_aware(datetime.strptime(date_from, "%Y-%m-%d"))
            date_to = timezone.make_aware(
                datetime.strptime(date_to, "%Y-%m-%d")
            ) + timedelta(days=1)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        report = {}

        # Clean base — no extra JOINs that inflate counts
        achievements_base = (
            Achievement.achievements.by_user(user)
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
        )

        # Annotated version only used where those fields are needed
        achievements_annotated = (
            achievements_base.with_confirmation_count().with_reaction_count()
        )

        report["total_achievements"] = achievements_base.count()

        report["daily_achievements"] = list(
            achievements_base.values("day").annotate(total=Count("id")).order_by("day")
        )

        report["top_achievements"] = list(
            achievements_annotated.order_by("-confirmation_count").values(
                "id", "title", "confirmation_count", "reaction_count"
            )[:5]
        )

        # Confirmations
        confirmations_received = (
            AchievementConfirmation.confirmations.filter(achievement__user=user)
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
        )

        confirmations_given = (
            AchievementConfirmation.confirmations.filter(user=user)
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
        )

        report["total_confirmations_received"] = confirmations_received.count()
        report["total_confirmations_given"] = confirmations_given.count()

        report["daily_confirmations_received"] = list(
            confirmations_received.values("day")
            .annotate(total=Count("id"))
            .order_by("day")
        )

        report["top_confirmers"] = list(
            confirmations_received.values("user_id", "user__name")
            .annotate(confirmation_count=Count("id"))
            .order_by("-confirmation_count")[:5]
        )

        # Glazes
        glazes_received = (
            Glaze.glazes.received_by(user)
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
        )

        glazes_sent = (
            Glaze.glazes.sent_by(user)
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
        )

        report["total_glazes_received"] = glazes_received.count()
        report["total_glazes_sent"] = glazes_sent.count()

        report["daily_glazes_received"] = list(
            glazes_received.values("day").annotate(total=Count("id")).order_by("day")
        )

        report["daily_glazes_sent"] = list(
            glazes_sent.values("day").annotate(total=Count("id")).order_by("day")
        )

        report["top_glazers"] = list(
            glazes_received.values("posting_user_id", "posting_user__name")
            .annotate(glaze_count=Count("id"))
            .order_by("-glaze_count")[:5]
        )

        report["users_most_glazed_by_user"] = list(
            glazes_sent.values("receiving_user_id", "receiving_user__name")
            .annotate(glaze_count=Count("id"))
            .order_by("-glaze_count")[:5]
        )

        # Cross-team glazes
        cross_team_received = (
            Glaze.glazes.cross_team()
            .received_by(user)
            .within_date_range(date_from, date_to)
        )

        cross_team_sent = (
            Glaze.glazes.cross_team()
            .sent_by(user)
            .within_date_range(date_from, date_to)
        )

        report["cross_team_glazes_received"] = cross_team_received.count()
        report["cross_team_glazes_sent"] = cross_team_sent.count()

        report["external_teams_recognising_user"] = list(
            cross_team_received.values(
                "posting_user__teammember__team__id",
                "posting_user__teammember__team__name",
            )
            .annotate(glaze_count=Count("id"))
            .order_by("-glaze_count")[:5]
        )

        return JsonResponse(report)
