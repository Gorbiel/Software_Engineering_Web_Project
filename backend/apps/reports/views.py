from datetime import datetime

from django.db.models import Count, ExpressionWrapper, F, IntegerField, Sum, Model, Q
from django.db.models.functions import TruncDay
from django.http import JsonResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.achievements.models import Achievement, AchievementConfirmation
from apps.glazes.models import Glaze
from apps.tags.models import AchievementTag, Tag
from apps.teams.models import Team
from apps.users.models import User
from apps.users.permissions import IsGlazedInAdmin


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsGlazedInAdmin]

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
            date_from = datetime.strptime(date_from, "%Y-%m-%d")
            date_to = datetime.strptime(date_to, "%Y-%m-%d")
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = {}

        achievements_in_period = (
            Achievement.achievements.within_date_range(date_from, date_to)
            .with_confirmation_count()
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        confirmations_in_period = (
            AchievementConfirmation.confirmations.within_date_range(
                date_from, date_to
            ).annotate(day=TruncDay("creation_date"))
        )

        report["daily_achievement_counts"] = (
            achievements_in_period.values("day")
            .annotate(total=Count("id"))
            .order_by("day")
        )

        report["daily_achievement_confirmations"] = (
            achievements_in_period.values("day")
            .annotate(total=Sum("achievementconfirmation"))
            .order_by("day")
        )

        report["daily_achievement_reactions"] = (
            achievements_in_period.values("day")
            .annotate(total=Sum("achievementreaction"))
            .order_by("day")
        )

        glazes_in_period = (
            Glaze.glazes.within_date_range(date_from, date_to)
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        achievement_users = achievements_in_period.values("day", "user_id")

        confirming_users = confirmations_in_period.values("day", "user_id")

        glaze_users = glazes_in_period.values("day", "user_id")

        report["active_user_daily_count"] = (
            achievement_users.union(confirming_users, glaze_users)
            .values("day")
            .annotate(active_users=Count("user_id"))
            .order_by("day")
        )

        users_with_glaze_counts = User.objects.annotate(
            received_glaze_count=Count("receiver", distinct=True),
            sent_glaze_count=Count("poster", distinct=True),
        )

        report["most_glazed_users"] = users_with_glaze_counts.order_by(
            "-received_glaze_count"
        )[:10]

        report["best_glazing_users"] = users_with_glaze_counts.order_by(
            "-sent_glaze_count"
        )[:10]

        teams_with_engagement_data = (
            Team.teams
            .with_engagement(date_from, date_to)
            .with_participation_rate(date_from, date_to)
            .with_cross_team_engagement(date_from, date_to)
        )

        report["teams_with_most_achivemnents"] = (
            teams_with_engagement_data
            .order_by("-achievements_count")
            .values("id")[:10]
        )

        report["teams_with_most_recived_glazes"] = teams_with_engagement_data.order_by(
            "-glazes_received_count"
        ).values("id")[:10]

        report["teams_with_most_sent_glazes"] = teams_with_engagement_data.order_by(
            "-glazes_sent_count"
        ).values("id")[:10]

        report["teams_with_most_confirmations"] = teams_with_engagement_data.order_by(
            "-confirmations_count"
        ).values("id")[:10]

        report["most_active_teams"] = (teams_with_engagement_data
                                       .order_by("-participation_rate"))

        report["teams_with_most_cross_team_engagment"] = (
            teams_with_engagement_data.annotate(
                cross_team_sum=ExpressionWrapper(
                    F("cross_team_glazes_received") + F("cross_team_glazes_sent"),
                    output_field=IntegerField(),
                )
            )
            .order_by("-cross_team_sum")
            .values("id")[:10]
        )

        report["probable_siloed_teams"] = (
            teams_with_engagement_data.annotate(
                cross_team_sum=ExpressionWrapper(
                    F("cross_team_glazes_received") + F("cross_team_glazes_sent"),
                    output_field=IntegerField(),
                )
            )
            .order_by("cross_team_sum")
            .values("id")[:10]
        )

        report["top_achievement_tags"] = (
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

        report["top_glaze_tags"] = (
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

    @action(detail=True, methods=["get"])  # detail=True gives you the pk
    def user(self, request, pk=None):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        if not date_from or not date_to:
            return Response(
                {"error": "date_from and date_to are required (YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            date_from = datetime.strptime(date_from, "%Y-%m-%d")
            date_to = datetime.strptime(date_to, "%Y-%m-%d")
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

        user_achievements = (
            Achievement.achievements.by_user(user)
            .within_date_range(date_from, date_to)
            .with_confirmation_count()
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        report["total_achievements"] = user_achievements.count()

        report["daily_achievements"] = (
            user_achievements.values("day").annotate(total=Count("id")).order_by("day")
        )

        report["top_achievements"] = user_achievements.order_by(
            "-confirmation_count"
        ).values("id", "title", "confirmation_count", "reaction_count")[:5]


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

        report["daily_confirmations_received"] = (
            confirmations_received.values("day")
            .annotate(total=Count("id"))
            .order_by("day")
        )

        report["top_confirmers"] = (
            confirmations_received.values("user_id", "user__name")
            .annotate(confirmation_count=Count("id"))
            .order_by("-confirmation_count")[:5]
        )

        glazes_received = (
            Glaze.glazes.received_by(user)
            .within_date_range(date_from, date_to)
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        glazes_sent = (
            Glaze.glazes.sent_by(user)
            .within_date_range(date_from, date_to)
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        report["total_glazes_received"] = glazes_received.count()
        report["total_glazes_sent"] = glazes_sent.count()

        report["daily_glazes_received"] = (
            glazes_received.values("day").annotate(total=Count("id")).order_by("day")
        )

        report["daily_glazes_sent"] = (
            glazes_sent.values("day").annotate(total=Count("id")).order_by("day")
        )

        report["top_glazers"] = (
            glazes_received.values("posting_user_id", "posting_user__name")
            .annotate(glaze_count=Count("id"))
            .order_by("-glaze_count")[:5]
        )

        report["users_most_glazed_by_user"] = (
            glazes_sent.values("receiving_user_id", "receiving_user__name")
            .annotate(glaze_count=Count("id"))
            .order_by("-glaze_count")[:5]
        )

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

        report["external_teams_recognising_user"] = (
            cross_team_received.values(
                "posting_user__teammember__team__id",
                "posting_user__teammember__team__name",
            )
            .annotate(glaze_count=Count("id"))
            .order_by("-glaze_count")[:5]
        )

        return JsonResponse(report)