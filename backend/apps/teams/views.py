from datetime import datetime

from django.db.models.functions import TruncDay
from django.db.models import Count, ExpressionWrapper, F, IntegerField, Sum, Q
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.achievements.models import AchievementConfirmation, Achievement
from apps.glazes.models import Glaze
from apps.tags.models import Tag
from apps.teams.models import Team
from apps.teams.permissions import IsLeaderOfTeam
from apps.teams.serializers import TeamSerializer
from apps.users.models import User
from apps.users.permissions import IsGlazedInAdmin


class TeamViewSet(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    queryset = Team.objects.all().order_by("id")
    serializer_class = TeamSerializer
    permission_classes = [IsLeaderOfTeam, IsGlazedInAdmin]

    @action(detail=True, methods=["get"])
    def report(self, request, pk=None):
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
            Achievement.achievements
            .by_team(pk)
            .within_date_range(date_from, date_to)
            .with_confirmation_count()
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        confirmations_in_period = (
            AchievementConfirmation.confirmations
            .by_team(pk)
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
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

        sent_glazes_in_period = (
            Glaze.glazes
            .given_by_team(pk)
            .within_date_range(date_from, date_to)
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        received_glazes_in_period = (
            Glaze.glazes
            .received_by_team(pk)
            .within_date_range(date_from, date_to)
            .with_reaction_count()
            .annotate(day=TruncDay("creation_date"))
        )

        users_with_glaze_counts = (User.users
        .in_team(pk)
        .annotate(
            received_glaze_count=Count("receiver", distinct=True),
            sent_glaze_count=Count("poster", distinct=True),
        ))

        achievement_users = achievements_in_period.values("day", "user_id")

        confirming_users = confirmations_in_period.values("day", "user_id")

        glaze_users = sent_glazes_in_period.values("day", "user_id")

        report["active_user_daily_count"] = (
            achievement_users.union(confirming_users, glaze_users)
            .values("day")
            .annotate(active_users=Count("user_id"))
            .order_by("day")
        )

        team = Team.teams.get(pk=pk).with_engagement().with_cross_team_engagement()

        report["achievements_count"] = team.achievements_count
        report["glazes_sent_count"] = team.glazes_sent_count
        report["glazes_received_count"] = team.glazes_sent_count
        report["confirmations_count"] = team.confirmations_count
        report["participation_rate"] = team.participation_rate
        report["cross_team_glazes_received"] = team.cross_team_glazes_received
        report["cross_team_glazes_sent"] = team.cross_team_glazes_sent

        report["most_glazed_users"] = users_with_glaze_counts.order_by(
            "-received_glaze_count"
        )[:10]

        report["best_glazing_users"] = users_with_glaze_counts.order_by(
            "-sent_glaze_count"
        )[:10]

        report["top_achievement_tags_used_by_team"] = (
            Tag.objects.annotate(
                usage_count=Count(
                    "achievementtag",
                    filter=Q(
                        achievementtag__achievement__creation_date__range=(
                            date_from,
                            date_to,
                        ),
                        achievementtag__achievement__user__teammember__team=pk
                    ),
                    distinct=True,
                )
            )
            .order_by("-usage_count")
            .values("tag_text", "usage_count")[:10]
        )

        report["top_glaze_tags_used_by_team"] = (
            Tag.tags.annotate(
                usage_count=Count(
                    "glazetag",
                    filter=Q(
                        glazetag__glaze__creation_date__range=(date_from, date_to),
                        glazetag__glaze__posting_user__teammember__team=pk
                    ),
                    distinct=True,
                )
            )
            .order_by("-usage_count")
            .values("tag_text", "usage_count")[:10]
        )

        report["top_glaze_tags_recieved_by_team"] = (
            Tag.tags.annotate(
                usage_count=Count(
                    "glazetag",
                    filter=Q(
                        glazetag__glaze__creation_date__range=(date_from, date_to),
                        glazetag__glaze__receiving_user__teammember__team=pk,
                    ),
                    distinct=True,
                )
            )
            .order_by("-usage_count")
            .values("tag_text", "usage_count")[:10]
        )
        
        return JsonResponse(report)