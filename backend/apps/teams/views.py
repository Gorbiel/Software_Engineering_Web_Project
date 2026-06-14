from django.http import Http404
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.teams.models import Team, TeamMember
from apps.teams.permissions import IsTeamLeaderOrAdmin
from apps.teams.serializers import (
    TeamMemberRankSerializer,
    TeamMemberResponseSerializer,
    TeamSerializer,
)
from common.pagination import SearchResultsSetPagination


class TeamSearchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Search teams by name.

    Query parameters:
    - q: Search query (required)
    - sort_by: 'name', 'creation_date' (default: 'name')
    - order: 'asc', 'desc' (default: 'asc')
    - page_size: Number of results per page (default: 20, max: 100)
    """

    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    pagination_class = SearchResultsSetPagination

    SORT_OPTIONS = ["name", "creation_date"]
    FILTER_OPTIONS = []

    def filters_and_sorting(self, request):
        """Expose available filters and sorting options for the frontend."""
        return Response(
            {
                "sort_options": self.SORT_OPTIONS,
                "filter_options": self.FILTER_OPTIONS,
            }
        )

    def get_queryset(self):
        queryset = Team.objects.all()
        search_query = self.request.query_params.get("q", "").strip()

        if not search_query:
            return queryset.none()

        # Search across name field
        queryset = queryset.filter(name__icontains=search_query)

        # Sorting
        sort_by = self.request.query_params.get("sort_by", "name")
        if sort_by not in self.SORT_OPTIONS:
            sort_by = "name"

        order = self.request.query_params.get("order", "asc")
        if order == "desc":
            sort_by = f"-{sort_by}"

        queryset = queryset.order_by(sort_by)

        return queryset


class TeamMemberRankUpdateView(APIView):
    """PATCH /teams/<team_id>/members/<user_id>/rank/

    Allows a team leader or admin to change another member's rank within the
    specified team.
    """

    permission_classes = [IsAuthenticated, IsTeamLeaderOrAdmin]

    def get_member(self, team_id, user_id):
        try:
            return TeamMember.objects.get(team_id=team_id, user_id=user_id)
        except TeamMember.DoesNotExist:
            raise Http404

    def patch(self, request, team_id, user_id):
        member = self.get_member(team_id, user_id)
        serializer = TeamMemberRankSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        member.rank = serializer.validated_data["rank"]
        member.save(update_fields=["rank"])

        resp = TeamMemberResponseSerializer(
            {"team_id": member.team_id, "user_id": member.user_id, "rank": member.rank}
        )
        return Response(resp.data)
from datetime import datetime, timedelta

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDay
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.achievements.models import Achievement, AchievementConfirmation
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

        # Clean base — no extra JOINs that inflate counts
        achievements_base = (
            Achievement.achievements.by_team(pk)
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
        )

        # Annotated version only where confirmation/reaction fields are needed
        achievements_annotated = (
            achievements_base.with_confirmation_count().with_reaction_count()
        )

        confirmations_in_period = (
            AchievementConfirmation.confirmations.filter(
                achievement__user__teammember__team=pk
            )  # by_team doesn't exist here
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
        )

        sent_glazes_in_period = (
            Glaze.glazes.by_team(pk)
            .within_date_range(date_from, date_to)
            .annotate(day=TruncDay("creation_date"))
        )

        # Achievement counts
        report["daily_achievement_counts"] = list(
            achievements_base.values("day").annotate(total=Count("id")).order_by("day")
        )

        report["daily_achievement_confirmations"] = list(
            achievements_annotated.values("day")
            .annotate(total=Sum("confirmation_count"))
            .order_by("day")
        )

        report["daily_achievement_reactions"] = list(
            achievements_annotated.values("day")
            .annotate(total=Sum("reaction_count"))
            .order_by("day")
        )

        # Active users per day — merge in Python to avoid union().annotate() error
        from collections import defaultdict

        achievement_by_day = achievements_base.values("day").annotate(
            users=Count("user_id", distinct=True)
        )

        confirmation_by_day = confirmations_in_period.values("day").annotate(
            users=Count("user_id", distinct=True)
        )

        glaze_by_day = sent_glazes_in_period.values("day").annotate(
            users=Count("posting_user_id", distinct=True)
        )

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

        # Team-level engagement — filter() then annotate, then get()
        team = (
            Team.teams.filter(pk=pk)
            .with_engagement(date_from, date_to)
            .with_participation_rate(date_from, date_to)
            .with_cross_team_engagement(date_from, date_to)
            .get()
        )

        report["achievements_count"] = team.achievements_count
        report["glazes_sent_count"] = team.glazes_sent_count
        report["glazes_received_count"] = (
            team.glazes_received_count
        )  # was copying glazes_sent_count by mistake
        report["confirmations_count"] = team.confirmations_count
        report["participation_rate"] = team.participation_rate
        report["cross_team_glazes_received"] = team.cross_team_glazes_received
        report["cross_team_glazes_sent"] = team.cross_team_glazes_sent

        # Top users
        users_with_glaze_counts = User.users.in_team(pk).annotate(
            received_glaze_count=Count("receiver", distinct=True),
            sent_glaze_count=Count("poster", distinct=True),
        )

        report["most_glazed_users"] = list(
            users_with_glaze_counts.order_by("-received_glaze_count").values(
                "id", "name", "email", "received_glaze_count"
            )[:10]
        )

        report["best_glazing_users"] = list(
            users_with_glaze_counts.order_by("-sent_glaze_count").values(
                "id", "name", "email", "sent_glaze_count"
            )[:10]
        )

        # Tags
        report["top_achievement_tags_used_by_team"] = list(
            Tag.objects.annotate(
                usage_count=Count(
                    "achievementtag",
                    filter=Q(
                        achievementtag__achievement__creation_date__range=(
                            date_from,
                            date_to,
                        ),
                        achievementtag__achievement__user__teammember__team=pk,
                    ),
                    distinct=True,
                )
            )
            .order_by("-usage_count")
            .values("tag_text", "usage_count")[:10]
        )

        report["top_glaze_tags_used_by_team"] = list(
            Tag.tags.annotate(
                usage_count=Count(
                    "glazetag",
                    filter=Q(
                        glazetag__glaze__creation_date__range=(date_from, date_to),
                        glazetag__glaze__posting_user__teammember__team=pk,
                    ),
                    distinct=True,
                )
            )
            .order_by("-usage_count")
            .values("tag_text", "usage_count")[:10]
        )

        report["top_glaze_tags_recieved_by_team"] = list(
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
