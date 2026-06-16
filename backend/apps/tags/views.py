from django.db import models
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.tags.models import Tag
from apps.tags.serializers import TagListSerializer, TagSerializer
from apps.teams.models import TeamMember


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tags.

    Permissions:
    - List/Retrieve: Any authenticated user
    - Create global tag: Superuser only
    - Create team tag: Team leader or superuser
    - Update/Delete: Creator or superuser
    """

    permission_classes = [IsAuthenticated]
    serializer_class = TagSerializer

    def get_queryset(self):
        """
        Return global tags available to every authenticated user.
        """
        return Tag.tags.global_tags().distinct()

    def get_serializer_class(self):
        """Use lightweight serializer for list action"""
        if self.action == "list" or self.action == "search":
            return TagListSerializer
        return TagSerializer

    @action(detail=False, methods=["get"])
    def search(self, request):
        """
        Search tags by text with optional team filter.

        Query params:
        - q: Search query (required)
        - team_id: Filter by team (optional)
        - include_global: Include global tags (default: true)
        """
        query = request.query_params.get("q", "").strip()
        team_id = request.query_params.get("team_id")
        include_global = (
            request.query_params.get("include_global", "true").lower() == "true"
        )  # noqa: E501

        if not query:
            return Response(
                {"error": "Search query 'q' is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Start with base queryset
        queryset = self.get_queryset()

        # Apply search
        queryset = queryset.filter(tag_text__icontains=query)

        # Apply team filter if specified
        if team_id:
            if include_global:
                queryset = queryset.filter(
                    models.Q(team_id=team_id) | models.Q(team__isnull=True)
                )
            else:
                queryset = queryset.filter(team_id=team_id)
        elif not include_global:
            queryset = queryset.exclude(team__isnull=True)

        # Limit results
        queryset = queryset[:20]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def global_tags(self, request):
        """Get all global tags"""
        tags = Tag.tags.global_tags()
        serializer = TagListSerializer(tags, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def team_tags(self, request):
        """
        Get tags for a specific team.

        Query params:
        - team_id: Team ID (required)
        """
        team_id = request.query_params.get("team_id")

        if not team_id:
            return Response(
                {"error": "team_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user is in the team
        is_member = TeamMember.objects.filter(
            user=request.user, team_id=team_id
        ).exists()

        if not is_member and not request.user.is_superuser:
            return Response(
                {"error": "You are not a member of this team"},
                status=status.HTTP_403_FORBIDDEN,
            )

        tags = Tag.tags.team_tags(team_id)
        serializer = TagListSerializer(tags, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def available_for_team(self, request):
        """
        Get all tags available for a team (global + team-specific).

        Query params:
        - team_id: Team ID (required)
        """
        team_id = request.query_params.get("team_id")

        if not team_id:
            return Response(
                {"error": "team_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user is in the team
        is_member = TeamMember.objects.filter(
            user=request.user, team_id=team_id
        ).exists()

        if not is_member and not request.user.is_superuser:
            return Response(
                {"error": "You are not a member of this team"},
                status=status.HTTP_403_FORBIDDEN,
            )

        tags = Tag.tags.available_for_team(team_id)
        serializer = TagListSerializer(tags, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        """Only creator or superuser can update"""
        user = self.request.user
        if serializer.instance.created_by != user and not user.is_superuser:
            raise PermissionDenied("You can only update tags you created")
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        """Only creator or superuser can delete"""
        user = self.request.user
        if instance.created_by != user and not user.is_superuser:
            raise PermissionDenied("You can only delete tags you created")
        return super().perform_destroy(instance)


# Made with Bob
