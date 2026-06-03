from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.teams.models import TeamMember
from apps.teams.permissions import IsTeamLeaderOrAdmin
from apps.teams.serializers import (
    TeamMemberRankSerializer,
    TeamMemberResponseSerializer,
)


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
