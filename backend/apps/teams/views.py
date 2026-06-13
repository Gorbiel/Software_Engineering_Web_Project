from django.http import JsonResponse
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.teams.models import Team
from apps.teams.permissions import IsLeaderOfTeam
from apps.teams.serializers import TeamSerializer
from apps.users.permissions import IsGlazedInAdmin


class TeamViewSet(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    queryset = Team.objects.all().order_by("id")
    serializer_class = TeamSerializer
    permission_classes = [IsLeaderOfTeam, IsGlazedInAdmin]

    @action(detail=True, methods=["get"])
    def report(self, request, pk=None):
        pass