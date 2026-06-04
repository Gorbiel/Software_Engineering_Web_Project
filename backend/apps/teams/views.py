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
